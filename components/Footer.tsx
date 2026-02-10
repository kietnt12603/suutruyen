'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#0f172a] border-t border-white/5 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                    <div className="max-w-md">
                        <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
                            <img
                                src="/images/logo_text.png"
                                alt="Logo Suu Truyen"
                                className="h-8 w-auto object-contain brightness-0 invert"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            <strong className="text-white font-bold">Suu Truyện</strong> - Đọc truyện online một cách nhanh nhất.
                            Hỗ trợ mọi thiết bị như di động và máy tính bảng. Trải nghiệm đọc truyện mượt mà,
                            giao diện hiện đại, tối ưu cho người dùng.
                        </p>
                    </div>

                    <div className="flex-1 max-w-2xl">
                        <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Từ khóa nổi bật</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'đam mỹ hài', 'truyện xuyên nhanh', 'truyện trọng sinh',
                                'truyện tiên hiệp', 'truyện kiếm hiệp', 'truyện ngôn tình',
                                'truyện sủng', 'truyện ngược', 'vô hạn lưu'
                            ].map((tag) => (
                                <Link
                                    key={tag}
                                    href="#"
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-lg text-xs text-slate-400 hover:text-blue-400 transition-all"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-[11px]">
                        © {new Date().getFullYear()} Suu Truyện. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/tos" className="text-slate-500 hover:text-white text-[11px] transition-colors">Điều khoản</Link>
                        <Link href="/privacy" className="text-slate-500 hover:text-white text-[11px] transition-colors">Bảo mật</Link>
                        <Link href="/about" className="text-slate-500 hover:text-white text-[11px] transition-colors">Giới thiệu</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
