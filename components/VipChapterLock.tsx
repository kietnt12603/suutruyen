'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { purchaseChapter, updateProfile } from '@/lib/api';
import { Lock, Gem, ShoppingCart, Loader2, AlertCircle, CheckCircle2, Zap, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Chapter } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface VipChapterLockProps {
    chapter: Chapter;
}

export default function VipChapterLock({ chapter }: VipChapterLockProps) {
    const router = useRouter();
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isUpdatingPref, setIsUpdatingPref] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const price = chapter.price ?? 0;
    const balance = profile?.linh_thach ?? 0;
    const isAutoBuy = profile?.is_auto_buy ?? false;

    const handlePurchase = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (balance < price) {
            setMessage({ type: 'error', text: 'Số dư Linh Thạch không đủ. Vui lòng nạp thêm.' });
            return;
        }

        setIsPurchasing(true);
        setMessage(null);
        try {
            const result = await purchaseChapter(chapter.id);
            if (result.success) {
                const successResult = result as { success: true; message: string };
                setMessage({ type: 'success', text: successResult.message });

                // Refresh profile immediately to update balance in header
                await refreshProfile();

                // Reload page to see content
                router.refresh();
            } else {
                const errorResult = result as { success: false; error: string };
                setMessage({ type: 'error', text: errorResult.error || 'Có lỗi xảy ra' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Đã có lỗi xảy ra khi thực hiện giao dịch' });
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleToggleAutoBuy = async (checked: boolean) => {
        if (!user) return;

        setIsUpdatingPref(true);
        try {
            const result = await updateProfile({ is_auto_buy: checked });
            if (result.success) {
                await refreshProfile();
            }
        } catch (error) {
            console.error('Failed to update auto-buy preference:', error);
        } finally {
            setIsUpdatingPref(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 w-full max-w-4xl mx-auto">
            <div className="w-full max-w-lg relative">
                {/* Visual backdrop glow for premium feel */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur-xl opacity-20 dark:opacity-40"></div>

                <Card className="relative w-full border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] ring-1 ring-slate-200 dark:ring-slate-800">
                    {/* Header: High-impact gradient */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 text-center text-white relative">
                        {/* Decorative circles */}
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white opacity-5 rounded-full blur-xl"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-6 border border-white/30 shadow-lg transform rotate-3">
                                <Lock className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">CHƯƠNG VIP</h2>
                            <p className="text-indigo-100/90 text-sm font-medium">Mở khóa để khám phá toàn bộ nội dung</p>
                        </div>
                    </div>

                    <CardContent className="p-8 space-y-8">
                        {/* Price & Status Row */}
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Gem className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Giá mở khóa</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{price}</span>
                                        <span className="text-xs font-bold text-indigo-500 uppercase">Linh Thạch</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none">
                                VIP
                            </div>
                        </div>

                        {/* Balance Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số dư linh thạch</span>
                                <Link href="/nap-linh-thach" className="flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Nạp thêm <Zap className="h-3 w-3 fill-current" />
                                </Link>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/30 shadow-sm flex items-center justify-center">
                                {authLoading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                                        <span className="text-sm font-bold text-slate-400">Đang kiểm tra...</span>
                                    </div>
                                ) : !user ? (
                                    <p className="text-amber-600 dark:text-amber-500 text-sm font-bold">Vui lòng đăng nhập</p>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                            {balance.toLocaleString()}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400 uppercase">LT</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Premium Auto-buy Toggle */}
                        {user && (
                            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                                        <Zap className="h-5 w-5 fill-current" />
                                    </div>
                                    <div>
                                        <Label htmlFor="auto-buy" className="text-sm font-black text-slate-900 dark:text-white cursor-pointer block">Tự động mua chương</Label>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Trải nghiệm không giới hạn</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isUpdatingPref && <Loader2 className="h-4 w-4 animate-spin text-indigo-500/50" />}
                                    <Switch
                                        id="auto-buy"
                                        checked={isAutoBuy}
                                        onCheckedChange={handleToggleAutoBuy}
                                        disabled={isUpdatingPref}
                                        className="data-[state=checked]:bg-indigo-600 scale-110"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Status Alert */}
                        {message && (
                            <div className={`flex items-center gap-4 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-300 ${message.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                <p className="text-sm font-bold leading-tight">{message.text}</p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-8 pt-0">
                        {authLoading ? (
                            <Button disabled className="w-full h-14 rounded-xl bg-slate-100 text-slate-400 border-none">
                                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                <span className="font-bold">ĐANG TẢI...</span>
                            </Button>
                        ) : !user ? (
                            <Button className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 transition-all active:scale-95" asChild>
                                <Link href="/login">ĐĂNG NHẬP MỞ KHÓA</Link>
                            </Button>
                        ) : (
                            <Button
                                className={`w-full h-16 rounded-2xl text-lg font-black shadow-xl transition-all duration-300 transform active:scale-[0.98] disabled:active:scale-100 gap-3 border-none ${isPurchasing || (message?.type === 'success') || balance < price
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                                    }`}
                                onClick={handlePurchase}
                                disabled={isPurchasing || (message?.type === 'success') || balance < price}
                            >
                                {isPurchasing ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="h-6 w-6" />
                                        <span>MỞ KHÓA CHƯƠNG NGAY</span>
                                    </div>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Bottom links */}
                <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 mb-8">
                    <div className="flex items-center gap-2 hover:text-indigo-500 transition-colors cursor-pointer group">
                        <Settings2 className="h-4 w-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Hỗ trợ</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <Link href="/nap-linh-thach" className="text-[10px] font-black tracking-widest uppercase hover:text-indigo-600">Cách nhận Linh Thạch</Link>
                </div>
            </div>
        </div>
    );
}
