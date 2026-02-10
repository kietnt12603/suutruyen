'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Gem, ArrowLeft, X, Copy, CheckCircle2, Sparkles, Star, List, Loader2 } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface TopUpPackage {
    id: string;
    amount: number;
    price: number;
    bonus: number;
    isHot?: boolean;
    name: string;
    tier?: 'starter' | 'popular' | 'vip' | 'premium' | 'ultimate' | 'god';
    privileges?: string[];
}

const PACKAGES: TopUpPackage[] = [
    // {
    //     id: 'p_test',
    //     amount: 100,
    //     price: 2000,
    //     bonus: 10,
    //     name: 'Gói Test Premium',
    //     tier: 'god',
    //     privileges: [
    //         'Dành cho Developer kiểm tra thanh toán',
    //         'Full hiệu ứng God-tier'
    //     ]
    // },
    { id: 'p1', amount: 200, price: 2000, bonus: 0, name: 'Gói Khởi Động', tier: 'starter' },
    { id: 'p2', amount: 550, price: 5000, bonus: 50, name: 'Gói Phổ Biến', isHot: true, tier: 'popular' },
    { id: 'p3', amount: 1200, price: 10000, bonus: 200, name: 'Gói VIP', tier: 'vip' },
    { id: 'p4', amount: 10000, price: 50000, bonus: 5000, name: 'Gói Đại Gia', tier: 'premium' },
    { id: 'p5', amount: 20000, price: 100000, bonus: 10000, name: 'Gói Siêu Đại Gia', tier: 'premium' },
    {
        id: 'p6',
        amount: 40000,
        // price: 2000000,
        price: 2000,
        bonus: 5000,
        name: 'Gói Tiên Tôn',
        tier: 'ultimate',
        privileges: [
            'Mở khóa Badge Tiên Tôn lấp lánh (30 ngày)',
            'Đọc trước chương VIP sớm hơn 1 giờ'
        ]
    },
    {
        id: 'p7',
        amount: 100000,
        // price: 5000000,
        price: 5000,
        bonus: 20000,
        name: 'Gói Thánh Chủ',
        tier: 'ultimate',
        privileges: [
            'Màu tên Vàng kim riêng biệt trong Bình luận',
            'Tắt hoàn toàn quảng cáo (Vĩnh viễn)',
            'Badge Thánh Chủ vĩnh viễn'
        ]
    },
    {
        id: 'p8',
        amount: 200000,
        // price: 10000000,
        price: 10000,
        bonus: 50000,
        name: 'Gói Chí Tôn Thần Hoàng',
        tier: 'god',
        privileges: [
            'Hiệu ứng xuất hiện đặc biệt & Khung Avatar',
            'Vinh danh trên "Bảng Vàng Công Đức"',
            'Quyền tham gia vote chọn bộ truyện tiếp theo'
        ]
    },
];

export default function NapLinhThachPage() {
    const { user, loading, refreshProfile } = useAuth();
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirectTo=/nap-linh-thach');
        }

        // Handle payment status from URL
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'success') {
            alert('🎉 Thanh toán thành công! Linh Thạch sẽ được cộng vào tài khoản của bạn trong giây lát.');
            // Clear params without refreshing
            window.history.replaceState({}, '', window.location.pathname);
        } else if (status === 'cancelled') {
            alert('❌ Giao dịch đã bị hủy.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const supabase = createSupabaseClient();
        console.log('Subscribing to realtime transactions for user:', user.id);

        const channel = supabase
            .channel(`public:transactions:user:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`
                },
                async (payload: any) => {
                    console.log('Realtime transaction update:', payload);
                    if (payload.new.status === 'paid' && payload.old.status === 'pending') {
                        // Success!
                        alert(`🎉 Tuyệt vời! Bạn vừa nhận được ${payload.new.linh_thach} Linh Thạch. Cảm ơn bạn đã ủng hộ!`);

                        // Close modal
                        setSelectedPackage(null);

                        // Refresh global balance
                        await refreshProfile();
                    }
                }
            )
            .subscribe();

        return () => {
            console.log('Unsubscribing from realtime transactions');
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handlePayOSPayment = async () => {
        if (!selectedPackage || !user) return;

        setIsPaying(true);
        try {
            const response = await fetch('/api/payos/create-payment-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedPackage.price,
                    packageId: selectedPackage.id,
                    packageName: selectedPackage.name,
                    linhThach: selectedPackage.amount + selectedPackage.bonus
                })
            });

            const data = await response.json();
            if (data.success && data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                alert(data.error || 'Lỗi khi tạo link thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 font-bold transition-all mb-8 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Quay lại trang chủ</span>
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center justify-center gap-4">
                        <Gem size={48} className="text-blue-500 animate-pulse" />
                        Nạp Linh Thạch
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Mua Linh Thạch để mở khóa các chương VIP và ủng hộ tác giả yêu thích của bạn.
                        Mỗi giao dịch là nguồn động lực to lớn cho đội ngũ dịch thuật!
                    </p>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
                    {PACKAGES.map((pkg) => {
                        const isStarter = pkg.tier === 'starter' || pkg.tier === 'popular';
                        const isVip = pkg.tier === 'vip';
                        const isPremium = pkg.tier === 'premium';
                        const isUltimate = pkg.tier === 'ultimate';
                        const isGod = pkg.tier === 'god';

                        let accentColor = 'blue';
                        let Icon = Gem;

                        if (isVip) accentColor = 'indigo';
                        if (isPremium) accentColor = 'amber';
                        if (isUltimate) accentColor = 'orange';
                        if (isGod) accentColor = 'rose';

                        const accentClass = {
                            blue: 'blue-500',
                            indigo: 'indigo-500',
                            amber: 'amber-500',
                            orange: 'orange-500',
                            rose: 'rose-500'
                        }[accentColor];

                        const bgAccentClass = {
                            blue: 'blue-600',
                            indigo: 'indigo-600',
                            amber: 'amber-600',
                            orange: 'orange-600',
                            rose: 'rose-600'
                        }[accentColor];

                        const shadowClass = {
                            blue: 'shadow-blue-600/20',
                            indigo: 'shadow-indigo-600/20',
                            amber: 'shadow-amber-600/20',
                            orange: 'shadow-orange-600/20',
                            rose: 'shadow-rose-600/20'
                        }[accentColor];

                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`relative bg-white/[0.03] border ${pkg.isHot ? `border-${accentClass}/50 scale-105 z-10` : 'border-white/10'} rounded-[32px] p-8 text-center cursor-pointer transition-all duration-500 hover:bg-white/[0.08] hover:border-${accentClass}/50 hover:-translate-y-2 group shadow-2xl flex flex-col`}
                            >
                                {/* Hot Badge */}
                                {pkg.isHot && (
                                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-${bgAccentClass} text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${shadowClass} italic flex items-center gap-2 whitespace-nowrap`}>
                                        <Star size={12} fill="currentColor" />
                                        Phổ biến nhất
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                )}

                                {/* Icon Container */}
                                <div className="w-20 h-20 mx-auto mb-8 relative">
                                    <div className={`absolute inset-0 bg-${accentClass}/20 blur-2xl rounded-full group-hover:bg-${accentClass}/40 transition-all`} />
                                    <div className={`relative w-full h-full bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center text-${accentClass} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                        {isGod ? <Star size={32} /> : isUltimate ? <Sparkles size={32} /> : <Gem size={32} />}
                                    </div>
                                </div>

                                {/* Package Info */}
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                                    {pkg.name}
                                </h3>

                                <div className="flex items-baseline justify-center gap-1 mb-6">
                                    <span className={`text-4xl font-black text-white italic tracking-tight group-hover:text-${accentClass} transition-colors`}>
                                        {(pkg.amount + pkg.bonus).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 uppercase italic"> LT</span>
                                </div>

                                {/* Privileges Section */}
                                <div className="flex-1 mb-8">
                                    {pkg.privileges ? (
                                        <ul className="space-y-2 text-left">
                                            {pkg.privileges.map((priv, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-400 italic leading-relaxed">
                                                    <CheckCircle2 size={12} className={`text-${accentClass} shrink-0 mt-0.5`} />
                                                    <span>{priv}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            {pkg.bonus > 0 ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black italic border border-emerald-500/20 animate-bounce-subtle">
                                                    <Sparkles size={12} />
                                                    Tặng thêm {pkg.bonus} LT
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Gói cơ bản</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Price Button */}
                                <div className={`w-full py-4 bg-white/5 group-hover:bg-${bgAccentClass} rounded-2xl text-white font-black text-lg transition-all duration-300 border border-white/5 group-hover:border-${accentClass}/50 group-hover:shadow-lg ${shadowClass} active:scale-95 italic`}>
                                    {formatCurrency(pkg.price)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Note */}
                <div className="max-w-2xl mx-auto p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl flex items-start gap-4 text-slate-400">
                    <Star className="text-blue-500 shrink-0 mt-1" size={20} />
                    <p className="text-sm font-medium leading-relaxed">
                        Lưu ý: Mọi giao dịch nạp Linh Thạch đều được xử lý tự động trong vòng 1-5 phút.
                        Nếu gặp bất kỳ vấn đề gì, vui lòng liên hệ Fanpage để được hỗ trợ nhanh nhất.
                    </p>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedPackage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 transition-all duration-500"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedPackage(null);
                    }}
                >
                    <div className="relative bg-[#1e293b] border border-white/10 rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPackage(null)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="overflow-y-auto p-10 scrollbar-hide">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mx-auto mb-6 italic transform -rotate-6">
                                    <Gem size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Thanh toán</h2>
                                <p className="text-sm font-bold text-slate-500 italic uppercase tracking-wider">Chọn phương thức thanh toán</p>
                            </div>

                            {/* Summary Box */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 mb-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Tổng thanh toán</p>
                                <div className="text-4xl font-black text-white italic tracking-tighter mb-4">
                                    {formatCurrency(selectedPackage.price)}
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-black italic border border-blue-600/20">
                                    <Gem size={14} />
                                    Nhận {selectedPackage.amount + selectedPackage.bonus} Linh Thạch
                                </div>
                            </div>

                            {/* PayOS Button */}
                            <button
                                onClick={handlePayOSPayment}
                                disabled={isPaying}
                                className={`w-full py-5 px-8 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-8 italic uppercase tracking-tight 
                                    ${isPaying ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'}`}
                            >
                                {isPaying ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Thanh toán PayOS
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative flex items-center gap-4 mb-8">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Hoặc chuyển khoản thủ công</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            {/* QR Section */}
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 mb-8 text-center ring-1 ring-blue-500/20">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 italic flex items-center justify-center gap-2">
                                    <Star size={12} fill="currentColor" />
                                    Quét mã VietQR
                                    <Star size={12} fill="currentColor" />
                                </p>

                                <div className="relative group inline-block p-4 bg-white rounded-2xl shadow-2xl">
                                    <img
                                        src={`https://img.vietqr.io/image/TCB-834399999999-compact2.png?amount=${selectedPackage.price}&addInfo=NAP ${user.email?.split('@')[0]}&accountName=Nguyen Tuan Kiet`}
                                        alt="VietQR Code"
                                        className="w-48 h-48 block"
                                    />
                                    <div className="absolute inset-0 border-4 border-blue-500/10 rounded-2xl pointer-events-none group-hover:border-blue-500/30 transition-all" />
                                </div>

                                <p className="mt-6 text-[11px] font-bold text-slate-500 italic max-w-[200px] mx-auto leading-relaxed">
                                    Mở ứng dụng ngân hàng và quét mã để thanh toán nhanh
                                </p>
                            </div>

                            {/* Bank Details */}
                            <div className="space-y-3">
                                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group">
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Ngân hàng</span>
                                        <span className="text-sm font-black text-slate-200">Techcombank</span>
                                    </div>
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <List size={18} />
                                    </div>
                                </div>

                                <div
                                    onClick={() => handleCopy('834399999999', 'account')}
                                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] hover:border-blue-500/30 transition-all"
                                >
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Số tài khoản</span>
                                        <span className="text-lg font-black text-white italic tracking-tight uppercase">834399999999</span>
                                    </div>
                                    <div className={`p-3 rounded-xl transition-all ${copied === 'account' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                        {copied === 'account' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    </div>
                                </div>

                                <div
                                    onClick={() => handleCopy(`NAP ${user.email?.split('@')[0]}`, 'content')}
                                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] hover:border-blue-500/30 transition-all"
                                >
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Nội dung chuyển khoản</span>
                                        <span className="text-lg font-black text-rose-500 italic tracking-tight uppercase">NAP {user.email?.split('@')[0]}</span>
                                    </div>
                                    <div className={`p-3 rounded-xl transition-all ${copied === 'content' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-rose-500 group-hover:text-white'}`}>
                                        {copied === 'content' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    </div>
                                </div>
                            </div>

                            {/* Final Note */}
                            <div className="mt-10 p-5 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                                <p className="text-[11px] font-bold text-blue-400 italic text-center leading-relaxed">
                                    💎 Sau khi chuyển khoản thành công, Linh Thạch sẽ được cộng vào ví của bạn trong vòng 1-5 phút.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
