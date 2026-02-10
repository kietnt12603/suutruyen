'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getUser } from '@/lib/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
    LayoutDashboard,
    BookOpen,
    List,
    Settings,
    Home,
    User,
    LogOut,
    Menu,
    ShieldCheck,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { user } = await getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const result = await signOut();
        if (result.success) {
            router.push('/admin/login');
            router.refresh();
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Quản lý Truyện', path: '/admin/stories', icon: BookOpen },
        { name: 'Quản lý Thể loại', path: '/admin/categories', icon: List },
        { name: 'Crawl Truyện', path: '/admin/crawler', icon: Download },
        { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
            {/* Admin Sidebar */}
            <aside className="hidden w-56 flex-col border-r bg-slate-900 text-slate-50 md:flex sticky top-0 h-screen">
                <div className="flex h-16 items-center border-b border-slate-800 px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-bold hover:opacity-90">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        <span className="text-xl tracking-tight">Admin Panel</span>
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-slate-800 p-4">
                    <Button variant="outline" className="w-full justify-start gap-2 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Về Trang Chủ
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Admin Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 md:px-6">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-auto flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-1 px-2 hover:bg-slate-100">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-sm shadow-emerald-900/10 uppercase">
                                        {user?.email?.[0] || 'A'}
                                    </div>
                                    <span className="hidden text-sm font-medium text-slate-700 lg:inline-block">
                                        {user?.email?.split('@')[0] || 'Administrator'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer w-full">
                                        <User className="h-4 w-4" />
                                        Hồ sơ
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 cursor-pointer w-full"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-6xl w-full">
                        {children}
                    </div>
                </main>

                {/* Admin Footer */}
                <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
                    <div className="container mx-auto px-4">
                        <p>© 2024 Web Truyện Admin. Built with Next.js & shadcn/ui.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
