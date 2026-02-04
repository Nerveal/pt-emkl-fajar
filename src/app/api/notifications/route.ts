import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/notifications
export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null } // Global notifications
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        const unreadCount = await prisma.notification.count({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null }
                ],
                isRead: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('[NOTIFICATIONS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH /api/notifications
// Mark all as read
export async function PATCH() {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.notification.updateMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null }
                ],
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[NOTIFICATIONS_PATCH]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
