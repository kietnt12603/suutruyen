'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser, signOut } from '@/lib/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
    User,
    Mail,
    Lock,
    Save,
    Key,
    Camera,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';

export default function AdminProfile() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        bio: 'Quản lý nội dung hệ thống Web Truyện.'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { user } = await getUser();
            if (user) {
                setUser(user);
                setFormData({
                    username: user.email?.split('@')[0] || 'admin',
                    fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Quản trị viên',
                    email: user.email || '',
                    bio: user.user_metadata?.bio || 'Quản lý nội dung hệ thống Web Truyện.'
                });
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus(null);

        const { createSupabaseClient } = await import('@/lib/supabase');
        const supabase = createSupabaseClient();

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: formData.fullName,
                bio: formData.bio
            }
        });

        if (error) {
            setStatus({ type: 'error', message: `Lỗi: ${error.message}` });
        } else {
            setStatus({ type: 'success', message: 'Thông tin cá nhân đã được cập nhật thành công!' });
        }
        setIsSaving(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setStatus({ type: 'error', message: 'Mật khẩu mới không khớp!' });
            return;
        }

        setIsSaving(true);

        const { createSupabaseClient } = await import('@/lib/supabase');
        const supabase = createSupabaseClient();

        const { error } = await supabase.auth.updateUser({
            password: passwordData.newPassword
        });

        if (error) {
            setStatus({ type: 'error', message: `Lỗi: ${error.message}` });
        } else {
            setStatus({ type: 'success', message: 'Mật khẩu đã được thay đổi thành công!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/admin" className="hover:text-emerald-600">Thống kê</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 font-medium">Hồ sơ cá nhân</span>
                </nav>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
            </div>

            {status && (
                <Alert variant={status.type === 'success' ? 'default' : 'destructive'} className={status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : ''}>
                    {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.type === 'success' ? 'Thành công' : 'Lỗi'}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 xl:grid-cols-3">
                {/* Profile Information */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
                            <CardDescription>Cập nhật thông tin công khai của bạn.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-semibold">Tên đăng nhập</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                disabled
                                                className="pl-10 bg-slate-50 border-slate-200"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Tên đăng nhập không thể thay đổi.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-semibold">Họ và tên</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="border-slate-200 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pl-10 border-slate-200 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="bio" className="text-sm font-semibold">Giới thiệu ngắn</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="border-slate-200 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Sidebar */}
                <div className="space-y-6">
                    {/* Avatar Card */}
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-600/20 uppercase">
                                        {formData.fullName.charAt(0)}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <Camera className="h-4 w-4 text-slate-600" />
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <h2 className="text-xl font-bold text-slate-900">{formData.fullName}</h2>
                                    <p className="text-slate-500 font-medium">Administrator</p>
                                    <p className="text-xs text-slate-400 mt-1 italic">{formData.email}</p>
                                </div>
                                <Separator className="my-6 w-full" />
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Vai trò:</span>
                                        <span className="font-semibold text-emerald-700">Administrator</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Trạng thái:</span>
                                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Đang hoạt động
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" title="currentPassword" className="text-sm font-semibold">Mật khẩu hiện tại</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 border-slate-200 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" title="newPassword" className="text-sm font-semibold">Mật khẩu mới</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 border-slate-200 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" title="confirmPassword" className="text-sm font-semibold">Xác nhận mật khẩu mới</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pl-10 border-slate-200 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <Button disabled={isSaving} className="w-full bg-slate-900 border-none hover:bg-slate-800 shadow-md">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                    Cập nhật mật khẩu
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
