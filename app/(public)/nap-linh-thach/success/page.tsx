'use client';

import Link from 'next/link';
import { CheckCircle2, Home, BookOpen, PartyPopper, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';

export default function TopUpSuccessPage() {
    const { refreshProfile } = useAuth();

    useEffect(() => {
        // Refresh balance immediately on success page
        console.log('[SuccessPage] Calling refreshProfile...');
        refreshProfile();

        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
                {/* Decorative background effects */}
                <div className="absolute -top-24 -left-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full animate-pulse delay-700" />

                <div className="relative bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[48px] p-8 md:p-16 text-center shadow-2xl overflow-hidden">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto mb-10 transform -rotate-12 animate-in zoom-in spin-in duration-700">
                        <CheckCircle2 size={48} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6 animate-in slide-in-from-bottom duration-700">
                        Nạp Thành Công!
                    </h1>

                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom duration-1000">
                        Chúc mừng! Linh Thạch đã được cộng vào tài khoản của bạn.
                        Cảm ơn bạn đã đồng hành và ủng hộ tác giả!
                        <PartyPopper className="inline-block ms-2 text-amber-400" size={24} />
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-1200">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95 group italic"
                        >
                            <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
                            Trang chủ
                        </Link>

                        <Link
                            href="/nap-linh-thach"
                            className="flex items-center justify-center gap-2 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 group italic border border-blue-400/20"
                        >
                            <span>Tiếp tục nạp</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Fun badge */}
                    <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-in fade-in duration-1500 delay-1000">
                        <BookOpen size={12} className="text-blue-500" />
                        Hãy tận hưởng những chương truyện hấp dẫn
                    </div>
                </div>
            </div>
        </div>
    );
}
