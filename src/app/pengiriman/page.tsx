"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function PengirimanPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        namaBarang: "",
        jumlah: "",
        satuan: "",
        tujuan: "",
        penerima: "",
        pelayaran: "",
        nomorKontainer: "",
        tanggalPengiriman: "",
    });

    const [penerimaOptions, setPenerimaOptions] = useState<{ value: string; label: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Conditional Logic for Penerima
    useEffect(() => {
        if (formData.tujuan === "Merauke") {
            setPenerimaOptions([
                { value: "FNB Pratama", label: "FNB Pratama" },
                { value: "Sinergi Padi", label: "Sinergi Padi" },
            ]);
        } else if (formData.tujuan === "Sorong") {
            setPenerimaOptions([
                { value: "Sentosa", label: "Sentosa" },
                { value: "Kurnia", label: "Kurnia" },
            ]);
        } else {
            setPenerimaOptions([]);
        }
        // Reset penerima when tujuan changes
        setFormData(prev => ({ ...prev, penerima: "" }));
    }, [formData.tujuan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    jumlah: parseInt(formData.jumlah) || 0,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/dashboard");
            } else {
                setError(data.error || 'Gagal menyimpan pengiriman');
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
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Buat Pengiriman Baru</h1>
                    <p className="text-slate-400">Isi formulir di bawah ini untuk input data pengiriman barang.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nama Barang"
                                name="namaBarang"
                                placeholder="Contoh: Beras, Semen..."
                                value={formData.namaBarang}
                                onChange={handleChange}
                                required
                                startIcon={<span className="material-symbols-outlined text-lg">inventory_2</span>}
                            />
                            <div className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <Input
                                        label="Jumlah Barang"
                                        name="jumlah"
                                        type="number"
                                        placeholder="0"
                                        value={formData.jumlah}
                                        onChange={handleChange}
                                        required
                                        startIcon={<span className="material-symbols-outlined text-lg">tag</span>}
                                    />
                                </div>
                                <div className="w-32">
                                    <Select
                                        name="satuan"
                                        value={formData.satuan}
                                        onChange={handleChange}
                                        required
                                        placeholder="Satuan"
                                        options={[
                                            { value: "Kg", label: "Kg" },
                                            { value: "Ton", label: "Ton" },
                                            { value: "Koli", label: "Koli" },
                                            { value: "Sak", label: "Sak" },
                                            { value: "Bal", label: "Bal" },
                                            { value: "Dus", label: "Dus" },
                                            { value: "Pcs", label: "Pcs" },
                                            { value: "Unit", label: "Unit" },
                                            { value: "M3", label: "M3" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Tujuan Pengiriman"
                                name="tujuan"
                                value={formData.tujuan}
                                onChange={handleChange}
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
                                value={formData.penerima}
                                onChange={handleChange}
                                required
                                placeholder={formData.tujuan ? "Pilih Penerima" : "Pilih Tujuan Terlebih Dahulu"}
                                options={penerimaOptions}
                                disabled={!formData.tujuan}
                            />
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Pelayaran"
                                name="pelayaran"
                                value={formData.pelayaran}
                                onChange={handleChange}
                                required
                                placeholder="Pilih Pelayaran"
                                options={[
                                    { value: "Spill", label: "Spill" },
                                    { value: "Tanto", label: "Tanto" },
                                ]}
                            />
                            <Input
                                label="Nomor Kontainer"
                                name="nomorKontainer"
                                placeholder="ABCD-1234567"
                                value={formData.nomorKontainer}
                                onChange={handleChange}
                                required
                                startIcon={<span className="material-symbols-outlined text-lg">view_in_ar</span>} // material symbol for container
                            />
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Tanggal Pengiriman"
                                name="tanggalPengiriman"
                                type="date"
                                value={formData.tanggalPengiriman}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => router.back()}>
                                Batal
                            </Button>
                            <Button type="submit" isLoading={isSubmitting} leftIcon={<span className="material-symbols-outlined text-lg">save</span>}>
                                Simpan Pengiriman
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
