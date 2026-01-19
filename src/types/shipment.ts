export interface Shipment {
    id: string;
    namaBarang: string;
    jumlah: number;
    tujuan: 'Merauke' | 'Sorong';
    penerima: string;
    pelayaran: 'Spill' | 'Tanto';
    nomorKontainer: string;
    tanggalPengiriman: string; // ISO Date string
    createdAt: string;
    status: 'Active' | 'Completed' | 'Pending';
}

export interface User {
    id: string;
    username: string;
    name: string;
    role: 'Admin' | 'Operator';
    avatar?: string;
}

export const SHIPMENT_STATUS_LABELS = {
    Active: 'In Transit',
    Completed: 'Selesai',
    Pending: 'Menunggu',
};
