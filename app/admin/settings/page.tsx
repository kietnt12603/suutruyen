'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: 'Web Truyện',
        tagline: 'Đọc truyện online miễn phí',
        siteLogo: '/images/logo.png',
        metaDescription: 'Website đọc truyện tiên hiệp, ngôn tình, kiếm hiệp hất hiện nay.',
        keywords: 'truyen online, doc truyen, truyen chu',
        facebook: 'https://facebook.com/webtruyen',
        youtube: 'https://youtube.com/webtruyen',
        copyright: '© 2024 Web Truyện - All rights reserved.'
    });

    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'success', message: 'Các thiết lập hệ thống đã được lưu thành công!' });
        setTimeout(() => setStatus(null), 3000);
    };

    return (
        <div className="admin-settings">
            <div className="mb-4">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link href="/admin">Thống kê</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">Cấu hình hệ thống</li>
                    </ol>
                </nav>
                <h2 className="fw-bold mb-0">Cấu hình hệ thống</h2>
            </div>

            {status && (
                <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                    {status.message}
                    <button type="button" className="btn-close" onClick={() => setStatus(null)}></button>
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="row g-4">
                    {/* General Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold">Thông tin chung</h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Tên Website</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Slogan (Tagline)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="tagline"
                                        value={settings.tagline}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Đường dẫn Logo</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="siteLogo"
                                            value={settings.siteLogo}
                                            onChange={handleChange}
                                        />
                                        <span className="input-group-text bg-light">
                                            <i className="fa-solid fa-image"></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label fw-medium">Bản quyền Footer</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="copyright"
                                        value={settings.copyright}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold">Cấu hình SEO</h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Mô tả Website (Meta Description)</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        name="metaDescription"
                                        value={settings.metaDescription}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label fw-medium">Từ khóa (Keywords)</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        name="keywords"
                                        value={settings.keywords}
                                        onChange={handleChange}
                                        placeholder="Ngăn cách bởi dấu phẩy"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold">Mạng xã hội</h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">Facebook URL</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-primary text-white border-0">
                                                <i className="fa-brands fa-facebook"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="facebook"
                                                value={settings.facebook}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">YouTube URL</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-danger text-white border-0">
                                                <i className="fa-brands fa-youtube"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="youtube"
                                                value={settings.youtube}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card border-0 shadow-sm bg-light">
                            <div className="card-body d-flex justify-content-between align-items-center py-3">
                                <span className="text-muted small">
                                    <i className="fa-solid fa-circle-info me-2"></i>
                                    Nhấn lưu để áp dụng thay đổi toàn trang.
                                </span>
                                <button type="submit" className="btn btn-primary px-5 fw-bold">
                                    Lưu thiết lập
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
