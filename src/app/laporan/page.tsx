"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from 'docx';

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
    ukuran?: string;
    hargaSatuan?: number;
}

export default function LaporanPage() {
    const [filterDateStart, setFilterDateStart] = useState("");
    const [filterDateEnd, setFilterDateEnd] = useState("");
    const [data, setData] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async (startDate?: string, endDate?: string) => {
        setIsLoading(true);
        try {
            let url = '/api/shipments';
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const result = await res.json();
                setData(result.shipments || []);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilter = () => {
        fetchShipments(filterDateStart, filterDateEnd);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // --- TITLE ---
        doc.setFontSize(18);
        doc.setTextColor(41, 128, 185);
        doc.text("LAPORAN PENGIRIMAN", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("PT. EMKL FAJAR INDONESIA TIMUR", 14, 26);

        // --- DATE INFO ---
        if (filterDateStart && filterDateEnd) {
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`Periode: ${formatDate(filterDateStart)} - ${formatDate(filterDateEnd)}`, 14, 34);
        }

        // --- TABLE ---
        const tableBody = data.map((item, idx) => [
            idx + 1,
            item.nomorKontainer,
            item.namaBarang,
            `${item.jumlah} ${item.satuan}`,
            item.tujuan,
            item.penerima,
            item.ukuran || "-",
            item.hargaSatuan ? `Rp ${item.hargaSatuan.toLocaleString('id-ID')}` : "-",
            formatDate(item.tanggalPengiriman)
        ]);

        autoTable(doc, {
            startY: filterDateStart && filterDateEnd ? 40 : 35,
            head: [['No', 'No. Kontainer', 'Nama Barang', 'Jumlah', 'Tujuan', 'Penerima', 'Ukuran', 'Harga Satuan', 'Tanggal']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 8
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [50, 50, 50]
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // No
                1: { cellWidth: 25 }, // No. Kontainer
                2: { cellWidth: 25 }, // Nama Barang
                3: { cellWidth: 20 }, // Jumlah
                4: { cellWidth: 20 }, // Tujuan
                5: { cellWidth: 25 }, // Penerima
                6: { cellWidth: 15, halign: 'center' }, // Ukuran
                7: { cellWidth: 25, halign: 'right' }, // Harga Satuan
                8: { cellWidth: 20, halign: 'center' } // Tanggal
            },
            styles: {
                overflow: 'linebreak',
                cellPadding: 2
            }
        });

        doc.save('laporan-pengiriman.pdf');
    };

    const handleExportExcel = () => {
        const exportData = data.map(item => ({
            'No. Kontainer': item.nomorKontainer,
            'Nama Barang': item.namaBarang,
            'Jumlah': `${item.jumlah} ${item.satuan}`,
            'Tujuan': item.tujuan,
            'Penerima': item.penerima,
            'Pelayaran': item.pelayaran,
            'Harga Satuan': item.hargaSatuan,
            'Ukuran': item.ukuran || "-",
            'Tanggal': formatDate(item.tanggalPengiriman)
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        XLSX.writeFile(wb, "laporan-pengiriman.xlsx");
    };

    const handleExportWord = async () => {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph("Laporan Pengiriman Barang - PT EMKL FAJAR"),
                    new Table({
                        rows: [
                            new TableRow({
                                children: ["No. Kontainer", "Nama Barang", "Tujuan", "Penerima", "Harga Satuan", "Ukuran", "Tanggal"].map(text =>
                                    new TableCell({ children: [new Paragraph(text)] })
                                )
                            }),
                            ...data.map(item =>
                                new TableRow({
                                    children: [item.nomorKontainer, item.namaBarang, item.tujuan, item.penerima, item.hargaSatuan ? `Rp ${item.hargaSatuan.toLocaleString('id-ID')}` : "-", item.ukuran || "-", formatDate(item.tanggalPengiriman)].map(text =>
                                        new TableCell({ children: [new Paragraph(text)] })
                                    )
                                })
                            )
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "laporan-pengiriman.docx");
    };



    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Laporan Pengiriman</h1>
                        <p className="text-slate-400">Rekapitulasi data pengiriman barang.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExportPDF} leftIcon={<span className="material-symbols-outlined text-lg">picture_as_pdf</span>}>
                            PDF
                        </Button>
                        <Button variant="secondary" onClick={handleExportExcel} leftIcon={<span className="material-symbols-outlined text-lg">table_view</span>}>
                            Excel
                        </Button>
                        <Button variant="secondary" onClick={handleExportWord} leftIcon={<span className="material-symbols-outlined text-lg">description</span>}>
                            Word
                        </Button>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-48">
                            <Input
                                label="Tanggal Mulai"
                                type="date"
                                value={filterDateStart}
                                onChange={(e) => setFilterDateStart(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Input
                                label="Tanggal Akhir"
                                type="date"
                                value={filterDateEnd}
                                onChange={(e) => setFilterDateEnd(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleFilter}>
                            Tampilkan
                        </Button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {isLoading ? (
                            <div className="text-center text-slate-400 py-8">Memuat data...</div>
                        ) : data.length === 0 ? (
                            <div className="text-center text-slate-400 py-8">Belum ada data pengiriman</div>
                        ) : (
                            data.map((item) => (
                                <div key={item.id} className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 uppercase tracking-wide">No. Kontainer</span>
                                            <span className="font-mono text-accent font-medium text-lg">{item.nomorKontainer}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                        <div>
                                            <span className="text-xs text-slate-400 block mb-1">Barang</span>
                                            <span className="text-white font-medium block">{item.namaBarang}</span>
                                            <span className="text-xs text-slate-500">{item.jumlah} {item.satuan} {item.ukuran ? `• ${item.ukuran}` : ''}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block mb-1">Tujuan</span>
                                            <span className="text-white font-medium block">{item.tujuan}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block mb-1">Penerima</span>
                                            <span className="text-white font-medium block">{item.penerima}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                                        <span>{formatDate(item.tanggalPengiriman)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                    <th className="px-6 py-4">No. Kontainer</th>
                                    <th className="px-6 py-4">Nama Barang</th>
                                    <th className="px-6 py-4">Tujuan</th>
                                    <th className="px-6 py-4">Penerima</th>
                                    <th className="px-6 py-4">Harga Satuan</th>
                                    <th className="px-6 py-4">Ukuran</th>
                                    <th className="px-6 py-4">Tanggal Pengiriman</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Belum ada data pengiriman</td>
                                    </tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-mono text-accent font-medium">{item.nomorKontainer}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{item.namaBarang}</span>
                                                    <span className="text-xs text-slate-500">{item.jumlah} {item.satuan}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{item.tujuan}</td>
                                            <td className="px-6 py-4 text-white font-medium">{item.penerima}</td>
                                            <td className="px-6 py-4 text-emerald-400 font-mono">
                                                {item.hargaSatuan ? `Rp ${item.hargaSatuan.toLocaleString('id-ID')}` : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{item.ukuran || "-"}</td>
                                            <td className="px-6 py-4 text-slate-400">{formatDate(item.tanggalPengiriman)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <p className="text-xs text-slate-500">Menampilkan {data.length} data</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
