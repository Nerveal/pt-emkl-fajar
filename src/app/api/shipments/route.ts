import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { shipmentSchema } from '@/lib/validation';

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
                { namaBarang: { contains: search, mode: 'insensitive' } },
                { nomorKontainer: { contains: search, mode: 'insensitive' } },
                { penerima: { contains: search, mode: 'insensitive' } },
                { tujuan: { contains: search, mode: 'insensitive' } },
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

        // Validate input
        const result = shipmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Data tidak valid', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        const shipment = await prisma.shipment.create({
            data: {
                namaBarang: data.namaBarang,
                jumlah: data.jumlah,
                satuan: data.satuan,
                tujuan: data.tujuan,
                penerima: data.penerima,
                pelayaran: data.pelayaran,
                nomorKontainer: data.nomorKontainer,
                ukuran: data.ukuran,
                hargaSatuan: data.hargaSatuan,
                tanggalPengiriman: new Date(data.tanggalPengiriman),
                userId: session.user.id,
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                title: 'Pengiriman Baru',
                message: `Pengiriman baru ${data.nomorKontainer} (${data.namaBarang}) telah dibuat oleh ${session.user.name || 'User'}.`,
            }
        });

        return NextResponse.json({ success: true, shipment }, { status: 201 });
    } catch (error) {
        console.error('Create shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
