import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, 'Username wajib diisi'),
    password: z.string().min(1, 'Password wajib diisi'),
});

export const shipmentSchema = z.object({
    namaBarang: z.string().min(1, 'Nama barang wajib diisi'),
    jumlah: z.number().positive('Jumlah harus lebih dari 0'),
    satuan: z.string().min(1, 'Satuan wajib dipilih'),
    tujuan: z.enum(['Merauke', 'Sorong'], { message: 'Tujuan tidak valid' }),
    penerima: z.string().min(1, 'Penerima wajib dipilih'),
    pelayaran: z.enum(['Spill', 'Tanto'], { message: 'Pelayaran tidak valid' }),
    nomorKontainer: z.string().min(1, 'Nomor kontainer wajib diisi'),
    tanggalPengiriman: z.string().min(1, 'Tanggal pengiriman wajib dipilih'),
});

export const shipmentUpdateSchema = shipmentSchema.partial().extend({
    status: z.enum(['Active', 'Completed', 'Pending']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ShipmentInput = z.infer<typeof shipmentSchema>;
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateSchema>;
