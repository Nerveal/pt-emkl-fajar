import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Admin Logistics',
            role: 'Admin',
        },
    });

    console.log('Created admin user:', admin.username);

    // Create sample shipments
    const sampleShipments = [
        {
            namaBarang: 'Beras Premium',
            jumlah: 500,
            satuan: 'Sak',
            tujuan: 'Merauke',
            penerima: 'FNB Pratama',
            pelayaran: 'Spill',
            nomorKontainer: 'SPIL-2024-001',
            tanggalPengiriman: new Date('2024-01-15'),
            status: 'Completed',
            userId: admin.id,
        },
        {
            namaBarang: 'Semen Gresik',
            jumlah: 200,
            satuan: 'Sak',
            tujuan: 'Sorong',
            penerima: 'Sentosa',
            pelayaran: 'Tanto',
            nomorKontainer: 'TNTO-2024-002',
            tanggalPengiriman: new Date('2024-01-20'),
            status: 'Active',
            userId: admin.id,
        },
        {
            namaBarang: 'Minyak Goreng',
            jumlah: 1000,
            satuan: 'Dus',
            tujuan: 'Merauke',
            penerima: 'Sinergi Padi',
            pelayaran: 'Spill',
            nomorKontainer: 'SPIL-2024-003',
            tanggalPengiriman: new Date('2024-01-25'),
            status: 'Active',
            userId: admin.id,
        },
    ];

    for (const shipment of sampleShipments) {
        await prisma.shipment.create({ data: shipment });
    }

    console.log('Created sample shipments');
    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
