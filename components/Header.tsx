'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, LogOut, Settings, Gem, LogIn, UserPlus } from 'lucide-react';
import type { Category } from '@/types';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
    const router = useRouter();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isChapterOpen, setIsChapterOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const { user, profile, signOut, loading } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 hidden lg:block border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md shadow-lg shadow-black/20">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo Section */}
                <div className="flex items-center gap-8 shrink-0">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <Image
                            src="/images/logo_text.png"
                            alt="Logo Suu Truyen"
                            width={150}
                            height={32}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="flex items-center gap-2">
                        {/* Categories Dropdown */}
                        <div className="relative group">
                            <button
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${isCategoryOpen
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    setIsCategoryOpen(!isCategoryOpen);
                                    setIsChapterOpen(false);
                                }}
                            >
                                <span>Thể loại</span>
                                <svg className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Categories Menu */}
                            {isCategoryOpen && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsCategoryOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-4 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={`/category/${cat.slug}`}
                                                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setIsCategoryOpen(false)}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Chapters Dropdown */}
                        <div className="relative group">
                            <button
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${isChapterOpen
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    setIsChapterOpen(!isChapterOpen);
                                    setIsCategoryOpen(false);
                                }}
                            >
                                <span>Số chương</span>
                                <svg className={`w-4 h-4 transition-transform duration-200 ${isChapterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Chapters Menu */}
                            {isChapterOpen && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsChapterOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link href="/list/duoi-100-chuong" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsChapterOpen(false)}>Dưới 100 chương</Link>
                                        <Link href="/list/100-500-chuong" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsChapterOpen(false)}>100 - 500 chương</Link>
                                        <Link href="/list/500-1000-chuong" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsChapterOpen(false)}>500 - 1000 chương</Link>
                                        <Link href="/list/tren-1000-chuong" className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsChapterOpen(false)}>Trên 1000 chương</Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </nav>
                </div>

                {/* Search & Actions */}
                <div className="flex-1 max-w-2xl flex items-center justify-end gap-6">
                    <SearchBar />

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {loading ? (
                            <div className="h-9 w-9 rounded-full bg-slate-800 animate-pulse"></div>
                        ) : user ? (
                            <div className="relative">
                                <button
                                    className={`flex items-center gap-2.5 p-1 pr-4 rounded-full border border-white/10 transition-all ${isUserOpen ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => {
                                        setIsUserOpen(!isUserOpen);
                                        setIsCategoryOpen(false);
                                        setIsChapterOpen(false);
                                    }}
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-white text-xs font-bold truncate max-w-[100px]">
                                            {profile?.full_name || 'Người dùng'}
                                        </span>
                                        <span className="text-blue-400 text-[10px] font-medium mt-0.5">
                                            {profile?.linh_thach || 0} Linh thạch
                                        </span>
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                {isUserOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserOpen(false)} />
                                        <div className="absolute top-full right-0 mt-3 w-64 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Email</p>
                                                <p className="text-white text-sm truncate">{user.email}</p>
                                            </div>

                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setIsUserOpen(false)}
                                            >
                                                <Settings size={18} className="text-blue-400" />
                                                <span>Hồ sơ cá nhân</span>
                                            </Link>

                                            <Link
                                                href="/nap-linh-thach"
                                                className="flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                onClick={() => setIsUserOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Gem size={18} className="text-orange-500" />
                                                    <span>Nạp linh thạch</span>
                                                </div>
                                                <span className="bg-orange-500/20 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>
                                            </Link>

                                            <div className="h-px bg-white/5 my-2 mx-4"></div>

                                            <button
                                                type="button"
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors text-left"
                                                onClick={async () => {
                                                    setIsUserOpen(false);
                                                    await signOut();
                                                }}
                                            >
                                                <LogOut size={18} />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push('/dang-nhap')}
                                    className="px-5 py-2 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Đăng nhập</span>
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>Đăng ký</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
