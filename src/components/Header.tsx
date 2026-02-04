import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface HeaderProps {
    onMenuClick?: () => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications", { method: "PATCH" });
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    // Polling every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!showDropdown && unreadCount > 0) {
            markAllAsRead();
        }
        setShowDropdown(!showDropdown);
    };

    return (
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 sticky top-0 z-20 bg-[#121416]/80 backdrop-blur-md border-b border-glass-border">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <div className="flex flex-col">
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                        Dashboard Overview
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-400">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-glass-border text-slate-400 hover:text-white hover:bg-white/5 transition-all relative"
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px" }}
                    >
                        notifications
                    </span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 size-2.5 rounded-full bg-accent animate-pulse ring-2 ring-[#121416]"></span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 rounded-xl glass-panel border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121416]/95 backdrop-blur-xl">
                            <h3 className="font-bold text-white">Notifikasi</h3>
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-accent hover:text-accent-hover font-medium"
                            >
                                Tandai sudah dibaca
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto bg-[#121416]/90 backdrop-blur-md">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Belum ada notifikasi
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className={`p-4 hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-accent/5' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 size-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-accent' : 'bg-slate-600'}`}></div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-500 block pt-1">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: id })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
