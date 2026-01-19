"use client";

import { useEffect, useState } from "react";

interface Stats {
    todayShipments: number;
    activeShipments: number;
    completedShipments: number;
    totalShipments: number;
}

export default function StatsGrid() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalForProgress = stats?.totalShipments || 1;

    return (
        <section className="grid grid-cols-1">
            {/* Total Shipments - Full Width Aesthetic Card */}
            <div className="relative overflow-hidden glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-accent/30 transition-all duration-300">

                {/* Decorative Background Gradient */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500 pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-500 pointer-events-none"></div>

                {/* Content */}
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 text-accent shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                            local_shipping
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide uppercase">
                            Total Pengiriman
                        </p>
                        <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1">
                            {isLoading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                stats?.totalShipments ?? 0
                            )}
                            <span className="text-lg md:text-2xl text-slate-500 font-bold ml-2">Unit</span>
                        </h4>
                    </div>
                </div>

                {/* Mini Chart / Visual Indicator (Mockup for aesthetics) */}
                <div className="relative z-10 flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Pencapaian</span>
                        <div className="flex items-end gap-2 text-emerald-400">
                            <span className="material-symbols-outlined icon-sm">trending_up</span>
                            <span className="font-bold text-sm">+12.5%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Status</span>
                        <div className="flex items-center gap-2 text-accent">
                            <span className="size-2 rounded-full bg-accent animate-pulse"></span>
                            <span className="font-bold text-sm">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
