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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 - Today's Shipments */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-primary/20 text-accent">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                            local_shipping
                        </span>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">
                        Total Pengiriman Hari Ini
                    </p>
                    <h4 className="text-4xl font-black text-white tracking-tight">
                        {isLoading ? "..." : stats?.todayShipments ?? 0}
                    </h4>
                </div>
            </div>

            {/* Stat 2 - Active/In Transit */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                            pending_actions
                        </span>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">
                        Sedang Diproses (In Transit)
                    </p>
                    <h4 className="text-4xl font-black text-white tracking-tight">
                        {isLoading ? "..." : stats?.activeShipments ?? 0}
                    </h4>
                    <div className="w-full bg-white/10 rounded-full h-1 mt-3 overflow-hidden">
                        <div
                            className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${((stats?.activeShipments ?? 0) / totalForProgress) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Stat 3 - Completed */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                            check_circle
                        </span>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">
                        Pengiriman Selesai
                    </p>
                    <h4 className="text-4xl font-black text-white tracking-tight">
                        {isLoading ? "..." : stats?.completedShipments ?? 0}
                    </h4>
                    <div className="w-full bg-white/10 rounded-full h-1 mt-3 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${((stats?.completedShipments ?? 0) / totalForProgress) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
