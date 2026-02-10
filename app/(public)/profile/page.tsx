'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Mail, Gem, ArrowLeft, LogOut, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirectTo=/profile');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="profile-page-wrapper flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) return null;

    const createdAt = new Date(user.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all active:scale-95"
                    >
                        <ArrowLeft size={16} />
                        <span>Trang chủ</span>
                    </Link>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-500/10"
                        onClick={() => {
                            signOut();
                            router.push('/');
                        }}
                    >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                    </button>
                </div>

                {/* Main Profile Card */}
                <div className="relative bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-sm">
                    {/* Cover / Decor */}
                    <div className="h-32 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30" />

                    <div className="px-8 pb-10">
                        {/* Avatar */}
                        <div className="relative -mt-12 mb-6 flex justify-center sm:justify-start">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600 border-4 border-[#1e293b] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-600/20 italic">
                                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* User Identity */}
                        <div className="text-center sm:text-left mb-10">
                            <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">
                                {profile?.full_name || 'Người dùng'}
                            </h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <Calendar size={14} className="text-blue-500" />
                                <span>Thành viên từ: {createdAt}</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email Stat */}
                            <div className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                                <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Mail size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Email</span>
                                    <p className="text-sm font-bold text-slate-200 truncate" title={user.email}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Gem Stat */}
                            <div className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                                <div className="w-12 h-12 flex items-center justify-center bg-yellow-500/10 rounded-xl text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                                    <Gem size={22} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Số dư Linh Thạch</span>
                                    <p className="text-xl font-black text-yellow-500 tracking-tight italic">
                                        {profile?.linh_thach || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Hoạt động gần đây</h3>
                    </div>

                    <div className="text-center py-10 px-4">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center text-slate-700 mx-auto mb-6 border border-white/5">
                            <Clock size={32} />
                        </div>
                        <p className="text-slate-500 font-medium mb-6 italic">Hiện chưa có hoạt động nào được ghi nhận trong thời gian gần đây.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/5"
                        >
                            Khám phá truyện mới
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
