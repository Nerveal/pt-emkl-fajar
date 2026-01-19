"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Username atau password salah");
                setIsSubmitting(false);
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat login");
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none bg-glow-gradient z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-image-glow-gradient opacity-50 z-0"></div>

            <div className="w-full max-w-md relative z-10 glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 mb-4">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontSize: "36px" }}
                        >
                            anchor
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">PT EMKL FAJAR</h1>
                    <p className="text-slate-400 text-sm tracking-wider">INDONESIA TIMUR</p>
                </div>

                <div className="space-y-6">
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Sign in with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f172a] px-2 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-sm">person</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-sm">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    placeholder="Masukkan password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Loading...' : 'Sign In with Credentials'}
                        </button>

                        <div className="text-center text-xs text-slate-500 mt-4">
                            <p>Demo Credentials: admin / admin123</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
