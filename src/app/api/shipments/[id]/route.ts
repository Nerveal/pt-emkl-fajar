import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { shipmentUpdateSchema } from '@/lib/validation';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/shipments/[id] - Get single shipment
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { id } = await params;

        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        if (!shipment) {
            return NextResponse.json({ error: 'Pengiriman tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ shipment });
    } catch (error) {
        console.error('Get shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// PUT /api/shipments/[id] - Update shipment
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Validate input
        const result = shipmentUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Data tidak valid', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        // Check if shipment exists
        const existing = await prisma.shipment.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Pengiriman tidak ditemukan' }, { status: 404 });
        }

        const shipment = await prisma.shipment.update({
            where: { id },
            data: {
                ...data,
                tanggalPengiriman: data.tanggalPengiriman ? new Date(data.tanggalPengiriman) : undefined,
            },
        });

        return NextResponse.json({ success: true, shipment });
    } catch (error) {
        console.error('Update shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// DELETE /api/shipments/[id] - Delete shipment
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        // Only Admin can delete
        if (session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
        }

        const { id } = await params;

        // Check if shipment exists
        const existing = await prisma.shipment.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Pengiriman tidak ditemukan' }, { status: 404 });
        }

        await prisma.shipment.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Pengiriman berhasil dihapus' });
    } catch (error) {
        console.error('Delete shipment error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
