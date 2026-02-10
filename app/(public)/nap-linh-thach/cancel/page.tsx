'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, RotateCcw, HelpCircle, MessageCircle } from 'lucide-react';

export default function TopUpCancelPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
                {/* Decorative background effects */}
                <div className="absolute -top-24 -right-20 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-slate-500/10 blur-[100px] rounded-full animate-pulse delay-700" />

                <div className="relative bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[48px] p-8 md:p-16 text-center shadow-2xl overflow-hidden">
                    {/* Cancel Icon */}
                    <div className="w-24 h-24 bg-red-500/20 border border-red-500/30 rounded-3xl flex items-center justify-center text-red-400 mx-auto mb-10 transform rotate-12 animate-in zoom-in duration-700">
                        <XCircle size={48} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6 animate-in slide-in-from-bottom duration-700">
                        Giao dịch đã hủy
                    </h1>

                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom duration-1000">
                        Giao dịch của bạn đã bị hủy hoặc không thể hoàn thành.
                        Đừng lo lắng, tài khoản của bạn chưa bị trừ tiền đâu nhé!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-1200">
                        <Link
                            href="/nap-linh-thach"
                            className="flex items-center justify-center gap-2 px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95 group italic"
                        >
                            <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            Thử lại lần nữa
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-8 py-5 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 group italic border border-slate-500/20"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Quay về trang chủ
                        </Link>
                    </div>

                    {/* Support Section */}
                    <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in duration-1500 delay-1000">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">
                            Bạn cần hỗ trợ?
                        </p>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-colors">
                                <HelpCircle size={14} className="text-blue-500" />
                                Hướng dẫn
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-colors">
                                <MessageCircle size={14} className="text-emerald-500" />
                                Liên hệ AD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
