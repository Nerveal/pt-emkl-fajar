import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count today's shipments
        const todayCount = await prisma.shipment.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Count by status
        const activeCount = await prisma.shipment.count({
            where: { status: 'Active' },
        });

        const completedCount = await prisma.shipment.count({
            where: { status: 'Completed' },
        });

        const pendingCount = await prisma.shipment.count({
            where: { status: 'Pending' },
        });

        // Total shipments
        const totalCount = await prisma.shipment.count();

        return NextResponse.json({
            todayShipments: todayCount,
            activeShipments: activeCount,
            completedShipments: completedCount,
            pendingShipments: pendingCount,
            totalShipments: totalCount,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
