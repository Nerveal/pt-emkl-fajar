"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Helper to check if link is active
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <aside className="relative z-10 hidden w-72 flex-col border-r border-glass-border bg-[#15181B]/95 backdrop-blur-xl lg:flex h-full">
            <div className="flex h-full flex-col p-6">
                {/* Brand */}
                <div className="flex items-center gap-3 pb-8">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontSize: "24px" }}
                        >
                            anchor
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-wide text-white leading-tight">
                            PT EMKL FAJAR
                        </h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wider">
                            INDONESIA TIMUR
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1">
                    <Link
                        href="/dashboard"
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${isActive("/dashboard")
                                ? "bg-primary/20 border border-primary/30 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined transition-colors ${isActive("/dashboard") ? "text-accent" : "group-hover:text-accent"
                                }`}
                        >
                            grid_view
                        </span>
                        <span className={`text-sm font-semibold ${isActive("/dashboard") ? "text-white" : ""}`}>Beranda</span>
                    </Link>
                    <Link
                        href="/pengiriman"
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${isActive("/pengiriman")
                                ? "bg-primary/20 border border-primary/30 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined transition-colors ${isActive("/pengiriman") ? "text-accent" : "group-hover:text-accent"
                                }`}
                        >
                            local_shipping
                        </span>
                        <span className="text-sm font-medium">Pengiriman</span>
                    </Link>
                    <Link
                        href="/laporan"
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${isActive("/laporan")
                                ? "bg-primary/20 border border-primary/30 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined transition-colors ${isActive("/laporan") ? "text-accent" : "group-hover:text-accent"
                                }`}
                        >
                            description
                        </span>
                        <span className="text-sm font-medium">Laporan</span>
                    </Link>
                </nav>

                {/* User Profile (Bottom) */}
                <div className="mt-auto pt-6 border-t border-glass-border">
                    <div className="flex items-center gap-3 rounded-xl p-2 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5">
                        <div
                            className="size-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                            style={{
                                backgroundImage: user?.avatar
                                    ? `url("${user.avatar}")`
                                    : 'url("https://ui-avatars.com/api/?name=Admin+Logistics&background=0ea5e9&color=fff")',
                            }}
                        ></div>
                        <div className="flex flex-col overflow-hidden text-left flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                                {user?.name || "Guest"}
                            </p>
                            <p className="truncate text-xs text-slate-400">{user?.role || "Gudang"}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="material-symbols-outlined ml-auto text-slate-500 hover:text-red-400 transition-colors"
                            style={{ fontSize: "20px" }}
                            title="Logout"
                        >
                            logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
