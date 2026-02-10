'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn(email, password);

            if (result.success) {
                window.location.href = redirectTo;
            } else {
                const errorMessage = result.error?.message || '';
                if (errorMessage.includes('Email not confirmed')) {
                    setError('Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn (kể cả mục Spam).');
                } else if (errorMessage.includes('Invalid login credentials')) {
                    setError('Email hoặc mật khẩu không chính xác.');
                } else {
                    setError(errorMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
                }
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại trang chủ
                </Link>

                <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 pb-6 text-center">
                        <CardTitle className="text-3xl font-bold text-white tracking-tight">Đăng nhập</CardTitle>
                        <CardDescription className="text-slate-400">
                            Đăng nhập để đọc chương VIP và quản lý tài khoản
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in zoom-in-95">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-300">Mật khẩu</Label>
                                    <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold shadow-lg shadow-blue-500/25 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-0"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-500">
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function UserLogin() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
