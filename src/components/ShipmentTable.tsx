"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Shipment {
    id: string;
    namaBarang: string;
    jumlah: number;
    satuan: string;
    tujuan: string;
    penerima: string;
    pelayaran: string;
    nomorKontainer: string;
    tanggalPengiriman: string;
    status: string;
    createdAt: string;
}

export default function ShipmentTable() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const res = await fetch('/api/shipments?limit=10');
            if (res.ok) {
                const data = await res.json();
                setShipments(data.shipments || []);
            }
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredShipments = shipments.filter(s =>
        s.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nomorKontainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.penerima.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>
                        Selesai
                    </span>
                );
            case 'Active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <span className="size-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                        In Transit
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Pending
                    </span>
                );
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <section className="flex flex-col gap-6 glass-panel rounded-2xl p-6 min-h-[400px]">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-white whitespace-nowrap">
                    Riwayat Pengiriman Terbaru
                </h3>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    {/* Search */}
                    <div className="relative group w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-accent transition-colors">
                                search
                            </span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 glass-input focus:ring-0 outline-none transition-all"
                            type="text"
                            placeholder="Cari Resi, Barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Main Action Button */}
                    <Link
                        href="/pengiriman"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover active:bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] border border-white/10 whitespace-nowrap w-full sm:w-auto"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                            add_circle
                        </span>
                        Buat Pengiriman Baru
                    </Link>
                </div>
            </div>

            {/* Mobile Card View (Visible on small screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {isLoading ? (
                    <div className="text-center text-slate-400 py-8">Memuat data...</div>
                ) : filteredShipments.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">Belum ada data pengiriman</div>
                ) : (
                    filteredShipments.map((shipment) => (
                        <div key={shipment.id} className="relative glass-panel p-4 rounded-xl border border-white/5 space-y-3 group hover:bg-white/[0.03] transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">No. Kontainer</span>
                                    <span className="font-mono text-accent font-medium text-lg">{shipment.nomorKontainer}</span>
                                </div>
                                <div className="scale-90 origin-top-right">
                                    {getStatusBadge(shipment.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">Barang</span>
                                    <span className="text-white font-medium block">{shipment.namaBarang}</span>
                                    <span className="text-xs text-slate-500">{shipment.jumlah} {shipment.satuan}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">Tujuan</span>
                                    <span className="text-white font-medium block">{shipment.tujuan}</span>
                                    <span className="text-xs text-slate-500">{shipment.penerima}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-slate-500">{formatDate(shipment.tanggalPengiriman)}</span>
                                <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                            <th className="px-6 py-4">No. Kontainer</th>
                            <th className="px-6 py-4">Nama Barang</th>
                            <th className="px-6 py-4">Tujuan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Tanggal Kirim</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filteredShipments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Belum ada data pengiriman
                                </td>
                            </tr>
                        ) : (
                            filteredShipments.map((shipment) => (
                                <tr key={shipment.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-mono text-accent font-medium">
                                        {shipment.nomorKontainer}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{shipment.namaBarang}</span>
                                            <span className="text-xs text-slate-500">{shipment.jumlah} {shipment.satuan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex flex-col">
                                            <span>{shipment.tujuan}</span>
                                            <span className="text-xs text-slate-500">{shipment.penerima}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                                    <td className="px-6 py-4 text-slate-400">{formatDate(shipment.tanggalPengiriman)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500">Menampilkan {filteredShipments.length} data</p>
            </div>
        </section>
    );
}
