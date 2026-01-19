export default function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 z-20 bg-[#121416]/80 backdrop-blur-md border-b border-glass-border">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Dashboard Overview
                </h2>
                <p className="text-sm text-slate-400">Jumat, 24 November 2023</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-glass-border text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px" }}
                    >
                        notifications
                    </span>
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-accent animate-pulse"></span>
                </button>
            </div>
        </header>
    );
}
