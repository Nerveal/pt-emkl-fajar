import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { shipmentSchema } from '@/lib/validation';
import { z } from 'zod';

// Temporary validation for new items structure until validation.ts is updated
const itemSchema = z.object({
    namaBarang: z.string().min(1, "Nama barang diperlukan"),
    jumlah: z.number().min(1, "Jumlah minimal 1"),
    satuan: z.string().min(1, "Satuan diperlukan"),
    ukuran: z.string().optional(),
    kubik: z.number().optional() // Make sure to handle this if it comes as string
});

const newShipmentSchema = z.object({
    // Header
    tanggalPengiriman: z.string().or(z.date()),
    namaKapal: z.string().optional(),
    etd: z.string().optional(),
    tujuan: z.string().min(1, "Tujuan diperlukan"),
    penerima: z.string().min(1, "Penerima diperlukan"),
    merk: z.string().optional(),
    nomorKontainer: z.string().min(1, "Nomor kontainer diperlukan"),

    // Items
    items: z.array(itemSchema).min(1, "Minimal satu barang diperlukan")
});

// GET /api/shipments - List all shipments with optional filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');

        // Pagination & Search params
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('q') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};

        if (startDate && endDate) {
            where.tanggalPengiriman = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        if (status) {
            where.status = status;
        }

        // Search logic
        if (search) {
            where.OR = [
                // Search in header fields
                { nomorKontainer: { contains: search, mode: 'insensitive' } },
                { penerima: { contains: search, mode: 'insensitive' } },
                { tujuan: { contains: search, mode: 'insensitive' } },
                { namaKapal: { contains: search, mode: 'insensitive' } },
                // Search in items (nested)
                {
                    items: {
                        some: {
                            namaBarang: { contains: search, mode: 'insensitive' }
                        }
                    }
                }
            ];
        }

        // Execute transactions in parallel
        const [shipments, total] = await Promise.all([
            prisma.shipment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip,
                include: {
                    user: {
                        select: { name: true },
                    },
                    items: true, // Include items
                },
            }),
            prisma.shipment.count({ where }),
        ]);

        return NextResponse.json({
            shipments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Get shipments error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// POST /api/shipments - Create new shipment
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const body = await request.json();

        // Validate input - Using local schema first to bypass potential old validation issues
        // In a real scenario, we should update lib/validation.ts but doing it here for speed/containment
        const result = newShipmentSchema.safeParse(body);

        // Fallback for deprecated fields: if 'items' is missing but old fields exist (legacy API call?), try to adapt
        // But for this task we assume we are updating the frontend too.

        if (!result.success) {
            return NextResponse.json(
                { error: 'Data tidak valid', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        const shipment = await prisma.shipment.create({
            data: {
                // Header fields
                tanggalPengiriman: new Date(data.tanggalPengiriman),
                namaKapal: data.namaKapal,
                etd: data.etd,
                tujuan: data.tujuan,
                penerima: data.penerima,
                merk: data.merk,
                nomorKontainer: data.nomorKontainer,
                userId: session.user.id,

                // Keep pelayaran optional/null if not sent
                // Create items
                items: {
                    create: data.items.map(item => ({
                        namaBarang: item.namaBarang,
                        jumlah: item.jumlah,
                        satuan: item.satuan,
                        ukuran: item.ukuran,
                        kubik: item.kubik
                    }))
                }
            },
            include: {
                items: true
            }
        });

        // Create notification
        const firstItem = data.items[0]?.namaBarang || 'Barang';
        const itemCount = data.items.length;
        const itemSummary = itemCount > 1 ? `${firstItem} (+${itemCount - 1} lainnya)` : firstItem;

        await prisma.notification.create({
            data: {
                title: 'Pengiriman Baru',
                message: `Pengiriman baru ${shipment.nomorKontainer} (${itemSummary}) telah dibuat oleh ${session.user.name || 'User'}.`,
            }
        });

        return NextResponse.json({ success: true, shipment }, { status: 201 });
    } catch (error) {
        console.error('Create shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
