import StatsGrid from "@/components/StatsGrid";
import ShipmentTable from "@/components/ShipmentTable";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Hero / Welcome Section */}
                <section className="relative overflow-hidden rounded-2xl glass-panel p-6 md:p-8">
                    <div
                        className="absolute inset-0 z-0 opacity-20 bg-center bg-cover mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMzeEbjfIOmJRxw0AWmhZsc_HSB1EIpj1QjDIbRRCNCld9gp4HsK_l7ld2dzvqc9uk2f9yUK3HqamB6ytt-bBmy7PB06t8M2uALj-tHURdS6gCyT47Peu4m7LehrisBzmV6HemEg1Gcz02ZOlSWRjTOS5PZYGDOHsPscZBZjSSD0xNHXguOr1G-NAJgHKCwx54M0XSG2pNZ7E1hgbe0xHbjgL5cXLuYg4ZNlQKpWPRlzqN-v8oYIjmdIVZ1axKQ8CiQg_Z9GUGu38")',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121416] via-[#121416]/80 to-transparent z-0"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-xl space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="animate-pulse">●</span> Live Updates
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                Selamat Datang, Admin.
                            </h3>
                            <p className="text-slate-300 text-sm md:text-lg">
                                Pantau seluruh armada logistik dan status pengiriman PT EMKL
                                Fajar secara real-time.
                            </p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="flex flex-col items-start md:items-end gap-1 text-left md:text-right px-4 border-r border-white/10 flex-1 md:flex-none">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                    Cuaca Surabaya
                                </span>
                                <div className="flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined text-yellow-400">
                                        partly_cloudy_day
                                    </span>
                                    <span className="font-bold">32°C</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-1 text-left md:text-right px-4 flex-1 md:flex-none">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                    Pelabuhan
                                </span>
                                <div className="flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined text-accent">
                                        anchor
                                    </span>
                                    <span className="font-bold">Tanjung Perak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <StatsGrid />
                <ShipmentTable />
            </div>
        </DashboardLayout>
    );
}
