import Link from 'next/link';
import { getTotalStats, getStories } from '@/lib/api';
import AdminImage from '@/components/admin/AdminImage';
import {
    BookOpen,
    FileText,
    List,
    Eye,
    Plus,
    Settings,
    ListChecks,
    CheckCircle2,
    Pencil,
    Trash2,
    ChevronRight
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardStatsRealtime from '@/components/admin/DashboardStatsRealtime';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    const statsData = await getTotalStats();
    const { data: recentStories } = await getStories({ limit: 5 });



    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan Dashboard</h2>
                    <p className="text-slate-500">Chào mừng trở lại, {user?.email?.split('@')[0] || 'Administrator'}.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">
                        Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>

            {/* Stats Cards - Real-time */}
            <DashboardStatsRealtime initialStats={statsData} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Stories Table */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Truyện mới cập nhật</CardTitle>
                            <CardDescription>5 truyện vừa đăng hoặc cập nhật gần nhất</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="hover:bg-slate-50">
                            <Link href="/admin/stories" className="flex items-center gap-1">
                                Xem tất cả <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="w-[40%] pl-6">Tên Truyện</TableHead>
                                    <TableHead>Tác giả</TableHead>
                                    <TableHead className="text-center">Trạng thái</TableHead>
                                    <TableHead className="text-right pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentStories.map((story) => (
                                    <TableRow key={story.id} className="group transition-colors hover:bg-slate-50/50">
                                        <TableCell className="pl-6 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded border bg-slate-50 shadow-sm transition-transform group-hover:scale-105">
                                                    <AdminImage
                                                        src={story.image}
                                                        alt={story.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <span className="line-clamp-1">{story.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">{story.author}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className={
                                                story.status === 'full'
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                    : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
                                            }>
                                                {story.status === 'full' ? 'Full' : 'Đang ra'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" asChild>
                                                    <Link href={`/admin/stories/${story.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions & Status */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm h-fit">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-xl font-bold">Thao tác nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 pt-6">
                            <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200" asChild>
                                <Link href="/admin/stories/new">
                                    <Plus className="h-4 w-4" /> Thêm Truyện Mới
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50" asChild>
                                <Link href="/admin/categories">
                                    <ListChecks className="h-4 w-4 text-blue-600" /> Quản lý Thể loại
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50" asChild>
                                <Link href="/admin/settings">
                                    <Settings className="h-4 w-4 text-slate-500" /> Cấu hình Hệ thống
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
                        <div className="absolute top-[-20%] right-[-10%] h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] h-24 w-24 rounded-full bg-black/10 blur-xl"></div>
                        <CardContent className="flex flex-col items-center p-8 text-center relative z-10">
                            <div className="mb-4 rounded-full bg-white/20 p-3 backdrop-blur-md shadow-inner">
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Hệ thống ổn định</h3>
                            <p className="mt-2 text-sm text-emerald-50/90 leading-relaxed">
                                Mọi dịch vụ đang hoạt động bình thường với hiệu năng tối ưu.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
