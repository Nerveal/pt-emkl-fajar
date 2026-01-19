import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { shipmentSchema } from '@/lib/validation';

// GET /api/shipments - List all shipments with optional filters
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');

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

        const shipments = await prisma.shipment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json({ shipments });
    } catch (error) {
        console.error('Get shipments error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// POST /api/shipments - Create new shipment
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
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
                tanggalPengiriman: new Date(data.tanggalPengiriman),
                userId: session.userId,
            },
        });

        return NextResponse.json({ success: true, shipment }, { status: 201 });
    } catch (error) {
        console.error('Create shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
