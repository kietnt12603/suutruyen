'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, Gem, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Category {
    slug: string;
    name: string;
}

interface HeaderMobileProps {
    categories: Category[];
}

export default function HeaderMobile({ categories }: HeaderMobileProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile, signOut } = useAuth();

    return (
        <div className="lg:hidden relative">
            {/* Mobile Top Bar */}
            <nav className="h-14 bg-[#0f172a] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-[60]">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/logo_text.png"
                        alt="Logo Suu Truyen"
                        width={120}
                        height={30}
                        className="h-7 w-auto object-contain"
                        priority
                    />
                </Link>
                <button
                    className="p-2 text-slate-300 hover:text-white transition-colors"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {/* Mobile Sidebar */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar Content */}
                    <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-[#0f172a] z-[80] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <Image
                                src="/images/logo_text.png"
                                alt="Logo Suu Truyen"
                                width={120}
                                height={30}
                                className="h-6 w-auto object-contain"
                            />
                            <button
                                className="p-2 text-slate-400 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Sidebar Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* User Section */}
                            <div className="space-y-4">
                                {user ? (
                                    <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold truncate leading-tight">{profile?.full_name || 'Người dùng'}</p>
                                                <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Gem className="h-4 w-4 text-orange-500" />
                                                <span className="text-white text-xs font-bold">{profile?.linh_thach || 0} Linh thạch</span>
                                            </div>
                                            <Link
                                                href="/nap-linh-thach"
                                                className="text-blue-400 text-[10px] font-bold uppercase tracking-wider"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Nạp thêm
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href="/profile"
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors gap-2"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Settings size={18} className="text-slate-400" />
                                                <span className="text-[10px] text-slate-300 font-medium">Hồ sơ</span>
                                            </Link>
                                            <button
                                                type="button"
                                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors gap-2"
                                                onClick={async () => {
                                                    setIsOpen(false);
                                                    await signOut();
                                                }}
                                            >
                                                <LogOut size={18} className="text-red-400" />
                                                <span className="text-[10px] text-red-300 font-medium">Đăng xuất</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        <button
                                            onClick={() => { setIsOpen(false); router.push('/dang-nhap'); }}
                                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all"
                                        >
                                            <LogIn className="h-5 w-5 text-slate-400" />
                                            <span>Đăng nhập</span>
                                        </button>
                                        <button
                                            onClick={() => { setIsOpen(false); router.push('/register'); }}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            <span>Đăng ký thành viên</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar Mobile */}
                            <div className="py-2">
                                <SearchBar />
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-6 pb-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-4 w-1 bg-blue-500 rounded-full" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Thể loại</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 px-1">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={`/category/${cat.slug}`}
                                                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Danh mục</h3>
                                    </div>
                                    <div className="space-y-1 px-1">
                                        <Link href="/list/truyen-hot" className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Truyện Hot</Link>
                                        <Link href="/list/truyen-moi" className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Truyện Mới Cập Nhật</Link>
                                        <Link href="/list/truyen-full" className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Truyện Đã Hoàn Thành</Link>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Số chương</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 px-1">
                                        <Link href="/list/duoi-100-chuong" className="px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Dưới 100</Link>
                                        <Link href="/list/100-500-chuong" className="px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>100 - 500</Link>
                                        <Link href="/list/500-1000-chuong" className="px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>500 - 1000</Link>
                                        <Link href="/list/tren-1000-chuong" className="px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>Trên 1000</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-white/5">
                            <ThemeToggle />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
