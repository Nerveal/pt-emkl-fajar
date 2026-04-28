"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface ShipmentItem {
    id: string;
    namaBarang: string;
    jumlah: number;
    satuan: string;
    ukuran?: string;
    kubik?: number;
}

interface Shipment {
    id: string;
    // Header
    namaKapal?: string;
    etd?: string;
    merk?: string;
    tujuan: string;
    penerima: string;
    nomorKontainer: string;
    tanggalPengiriman: string;
    status: string;
    createdAt: string;

    // Items
    items?: ShipmentItem[];

    // Legacy / Fallback
    namaBarang?: string;
    jumlah?: number;
    satuan?: string;
    ukuran?: string;
    hargaSatuan?: number;
    pelayaran?: string;
}

export default function ShipmentTable() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to page 1 on search
            fetchShipments(1, searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Fetch on page change (skip if caused by search reset)
    useEffect(() => {
        fetchShipments(currentPage, searchQuery);
    }, [currentPage]);

    const fetchShipments = async (page: number, query: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                q: query
            });

            const res = await fetch(`/api/shipments?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setShipments(data.shipments || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.pages);
                    setTotalItems(data.pagination.total);
                }
            } else {
                toast.error("Gagal memuat data pengiriman");
            }
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
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
                ) : shipments.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        {searchQuery ? "Data tidak ditemukan" : "Belum ada data pengiriman"}
                    </div>
                ) : (
                    shipments.map((shipment) => {
                        // Display Logic: Use first item or fallback to legacy
                        const hasItems = shipment.items && shipment.items.length > 0;
                        const firstItem = hasItems ? shipment.items![0] : shipment;
                        const itemCount = hasItems ? shipment.items!.length : 1;

                        const displayNamaBarang = firstItem.namaBarang || "-";
                        const displayJumlah = firstItem.jumlah || 0;
                        const displaySatuan = firstItem.satuan || "";
                        const displayUkuran = firstItem.ukuran || shipment.ukuran || "-";

                        return (
                            <div key={shipment.id} className="relative glass-panel p-4 rounded-xl border border-white/5 space-y-3 group hover:bg-white/[0.03] transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase tracking-wide">No. Kontainer</span>
                                        <span className="font-mono text-accent font-medium text-lg">{shipment.nomorKontainer}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400 uppercase tracking-wide">Penerima</span>
                                        <span className="text-white font-medium text-right">{shipment.penerima}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                    <div>
                                        <span className="text-xs text-slate-400 block mb-1">Barang</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium block">{displayNamaBarang}</span>
                                            {itemCount > 1 && (
                                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                                                    +{itemCount - 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 text-xs text-slate-500">
                                            <span>{displayJumlah} {displaySatuan}</span>
                                            {displayUkuran !== "-" && (
                                                <>
                                                    <span>•</span>
                                                    <span>{displayUkuran}</span>
                                                </>
                                            )}
                                        </div>
                                        {shipment.hargaSatuan && (
                                            <span className="text-xs text-emerald-500 block mt-1">
                                                {formatCurrency(shipment.hargaSatuan)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block mb-1">Tujuan</span>
                                        <span className="text-white font-medium block">{shipment.tujuan}</span>
                                        {shipment.namaKapal && (
                                            <span className="text-xs text-slate-500 block mt-1">{shipment.namaKapal}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-slate-500">{formatDate(shipment.tanggalPengiriman)}</span>
                                    <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                            <th className="px-6 py-4">No. Kontainer</th>
                            <th className="px-6 py-4">Nama Barang</th>
                            <th className="px-6 py-4">Ukuran</th>
                            <th className="px-6 py-4">Kapal / Pelayaran</th>
                            <th className="px-6 py-4">Tujuan</th>
                            <th className="px-6 py-4">Penerima</th>
                            <th className="px-6 py-4">Tanggal Kirim</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : shipments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                    {searchQuery ? "Data tidak ditemukan" : "Belum ada data pengiriman"}
                                </td>
                            </tr>
                        ) : (
                            shipments.map((shipment) => {
                                // Display Logic
                                const hasItems = shipment.items && shipment.items.length > 0;
                                const firstItem = hasItems ? shipment.items![0] : shipment;
                                const itemCount = hasItems ? shipment.items!.length : 1;

                                const displayNamaBarang = firstItem.namaBarang || "-";
                                const displayJumlah = firstItem.jumlah || 0;
                                const displaySatuan = firstItem.satuan || "";
                                const displayUkuran = firstItem.ukuran || shipment.ukuran || "-";
                                const displayKapal = shipment.namaKapal || shipment.pelayaran || "-";

                                return (
                                    <tr key={shipment.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-accent font-medium">
                                            {shipment.nomorKontainer}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium">{displayNamaBarang}</span>
                                                    {itemCount > 1 && (
                                                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                                                            +{itemCount - 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500">{displayJumlah} {displaySatuan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {displayUkuran}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {displayKapal}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            <span>{shipment.tujuan}</span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            {shipment.penerima}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{formatDate(shipment.tanggalPengiriman)}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500">
                    Menampilkan <span className="text-slate-300 font-medium">{shipments.length}</span> dari <span className="text-slate-300 font-medium">{totalItems}</span> data
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>

                    <div className="flex items-center gap-1">
                        <span className="px-3 py-1 rounded-lg bg-white/5 text-sm text-white font-medium min-w-[32px] text-center">
                            {currentPage}
                        </span>
                        <span className="text-slate-500 text-sm">/</span>
                        <span className="px-2 py-1 text-sm text-slate-500">
                            {totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
