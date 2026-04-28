"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ShipmentItem {
    id: string; // temp id for UI
    jumlah: string;
    satuan: string;
    namaBarang: string;
    ukuran: string;
    kubik: string;
}

export default function PengirimanPage() {
    const router = useRouter();

    // Header State
    const [headerData, setHeaderData] = useState({
        tanggalPengiriman: new Date().toISOString().split('T')[0],
        namaKapal: "",
        etd: "",
        tujuan: "",
        penerima: "",
        merk: "",
        nomorKontainer: "",
        pelayaran: "", // Optional or Deprecated but maybe useful
    });

    // Items State
    const [items, setItems] = useState<ShipmentItem[]>([
        { id: '1', jumlah: "", satuan: "", namaBarang: "", ukuran: "", kubik: "" }
    ]);

    const [penerimaOptions, setPenerimaOptions] = useState<{ value: string; label: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Conditional Logic for Penerima
    useEffect(() => {
        if (headerData.tujuan === "Merauke") {
            setPenerimaOptions([
                { value: "FNB Pratama", label: "FNB Pratama" },
                { value: "Sinergi Padi", label: "Sinergi Padi" },
            ]);
        } else if (headerData.tujuan === "Sorong") {
            setPenerimaOptions([
                { value: "Sentosa", label: "Sentosa" },
                { value: "Kurnia", label: "Kurnia" },
            ]);
        } else {
            setPenerimaOptions([]);
        }
    }, [headerData.tujuan]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setHeaderData(prev => ({ ...prev, [name]: value }));
    };

    // Item Logic
    const handleItemChange = (id: string, field: keyof ShipmentItem, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addItem = () => {
        setItems(prev => [
            ...prev,
            { id: Math.random().toString(36).substr(2, 9), jumlah: "", satuan: "", namaBarang: "", ukuran: "", kubik: "" }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Calculations
    const totalCollies = items.reduce((acc, item) => acc + (parseInt(item.jumlah) || 0), 0);
    const totalKubik = items.reduce((acc, item) => acc + (parseFloat(item.kubik) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Transform items to match API expectation
            const formattedItems = items.map(item => ({
                namaBarang: item.namaBarang,
                jumlah: parseInt(item.jumlah) || 0,
                satuan: item.satuan,
                ukuran: item.ukuran,
                kubik: parseFloat(item.kubik) || 0
            }));

            const payload = {
                ...headerData,
                items: formattedItems
            };

            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Pengiriman berhasil disimpan");
                router.push("/dashboard");
            } else {
                console.error("Submission failed:", data);
                if (data.details && typeof data.details === 'object' && data.details.fieldErrors) {
                    const fieldErrors = Object.values(data.details.fieldErrors).flat();
                    setError(fieldErrors.length > 0 ? String(fieldErrors[0]) : (data.error || 'Gagal menyimpan pengiriman'));
                } else {
                    setError(data.error || 'Gagal menyimpan pengiriman');
                }
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Terjadi kesalahan jaringan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Buat Pengiriman Baru</h1>
                    <p className="text-slate-400">Isi formulir di bawah ini untuk input data pengiriman barang.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Section 1: Detail Kapal & Tujuan */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                        <h2 className="text-lg font-semibold text-white">Detail Kapal & Tujuan</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Tanggal"
                                name="tanggalPengiriman"
                                type="date"
                                value={headerData.tanggalPengiriman}
                                onChange={handleHeaderChange}
                                required
                            />
                            <Input
                                label="Nama Kapal (Vessel)"
                                name="namaKapal"
                                placeholder="Contoh: KM. SPIL HASYA"
                                value={headerData.namaKapal}
                                onChange={handleHeaderChange}
                            />
                            <Input
                                label="ETD (Rencana Berangkat)"
                                name="etd"
                                placeholder="Contoh: 16 JANUARI 2026"
                                value={headerData.etd}
                                onChange={handleHeaderChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Select
                                label="Tujuan"
                                name="tujuan"
                                value={headerData.tujuan}
                                onChange={handleHeaderChange}
                                required
                                placeholder="Pilih Tujuan"
                                options={[
                                    { value: "Merauke", label: "Merauke" },
                                    { value: "Sorong", label: "Sorong" },
                                ]}
                            />
                            <Select
                                label="Penerima"
                                name="penerima"
                                value={headerData.penerima}
                                onChange={handleHeaderChange}
                                required
                                placeholder={headerData.tujuan ? "Pilih Penerima" : "Pilih Tujuan Dulu"}
                                options={penerimaOptions}
                                disabled={!headerData.tujuan}
                            />
                            <Input
                                label="Merk"
                                name="merk"
                                placeholder="Contoh: FNB"
                                value={headerData.merk}
                                onChange={handleHeaderChange}
                            />
                        </div>

                        <div className="grid grid-cols-1">
                            <Input
                                label="Nomor Kontainer"
                                name="nomorKontainer"
                                placeholder="Contoh: SPNU 318017-0"
                                value={headerData.nomorKontainer}
                                onChange={handleHeaderChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Section 2: Daftar Barang */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-lg font-semibold text-white">Daftar Barang</h2>
                            <div className="text-sm text-slate-400">
                                Total: <span className="text-white font-medium">{totalCollies} Collies</span> | <span className="text-white font-medium">{totalKubik.toFixed(2)} m³</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-white/5 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">
                                        <th className="px-4 py-3 w-12">No</th>
                                        <th className="px-4 py-3 w-32">Jumlah</th>
                                        <th className="px-4 py-3 w-32">Satuan</th>
                                        <th className="px-4 py-3">Nama Barang</th>
                                        <th className="px-4 py-3 w-32">Ukuran</th>
                                        <th className="px-4 py-3 w-32">Kubik</th>
                                        <th className="px-4 py-3 w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map((item, index) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02]">
                                            <td className="px-4 py-2 text-center text-slate-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.jumlah}
                                                    onChange={(e) => handleItemChange(item.id, 'jumlah', e.target.value)}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none text-center"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.satuan}
                                                    onChange={(e) => handleItemChange(item.id, 'satuan', e.target.value)}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none text-center"
                                                    placeholder="Pcs/Dos"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.namaBarang}
                                                    onChange={(e) => handleItemChange(item.id, 'namaBarang', e.target.value)}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
                                                    placeholder="Nama Barang"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.ukuran}
                                                    onChange={(e) => handleItemChange(item.id, 'ukuran', e.target.value)}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none text-center"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.kubik}
                                                    onChange={(e) => handleItemChange(item.id, 'kubik', e.target.value)}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none text-center"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={items.length === 1}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors font-medium px-2 py-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Tambah Baris
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} leftIcon={<span className="material-symbols-outlined text-lg">save</span>}>
                            Simpan Laporan
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
