'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Search, CheckCircle2, AlertCircle, Play, FileText, PauseCircle } from 'lucide-react';
import Image from 'next/image';
import { CrawlerStoryInfo, CrawlerChapter } from '@/lib/crawler';

export default function CrawlerPage() {
    const [urls, setUrls] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStory, setCurrentStory] = useState<CrawlerStoryInfo | null>(null);
    const [chapters, setChapters] = useState<CrawlerChapter[]>([]);
    const [processingChapters, setProcessingChapters] = useState<{ [key: string]: 'pending' | 'loading' | 'success' | 'error' | 'exists' }>({});
    const [logs, setLogs] = useState<{ time: string, message: string, type: 'info' | 'success' | 'error' }[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time, message, type }]);
    };

    const processChapter = async (storyId: number | string, chapter: CrawlerChapter, index: number) => {
        setProcessingChapters(prev => ({ ...prev, [index]: 'loading' }));
        try {
            const response = await fetch('/api/crawler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'fetch-chapter-content',
                    url: chapter.url
                })
            });
            const result = await response.json();

            if (result.success) {
                const saveResponse = await fetch('/api/crawler', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'save-chapter',
                        storyId,
                        title: result.data.title || chapter.title,
                        content: result.data.content,
                        url: chapter.url,
                        number: chapter.number
                    })
                });

                if (saveResponse.ok) {
                    const saveData = await saveResponse.json();
                    if (saveData.note === 'already-exists') {
                        setProcessingChapters(prev => ({ ...prev, [index]: 'exists' }));
                    } else {
                        setProcessingChapters(prev => ({ ...prev, [index]: 'success' }));
                    }
                    return true;
                } else {
                    setProcessingChapters(prev => ({ ...prev, [index]: 'error' }));
                    return false;
                }
            } else {
                setProcessingChapters(prev => ({ ...prev, [index]: 'error' }));
                return false;
            }
        } catch (error) {
            setProcessingChapters(prev => ({ ...prev, [index]: 'error' }));
            return false;
        }
    };

    const processSingleUrl = async (url: string) => {
        addLog(`Bắt đầu xử lý: ${url}`, 'info');

        // 1. Fetch Info
        setProcessingChapters({});
        setChapters([]);
        setCurrentStory(null);

        try {
            const infoRes = await fetch('/api/crawler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, action: 'fetch-info' })
            });
            const infoResult = await infoRes.json();

            if (!infoResult.success) {
                addLog(`Lỗi lấy thông tin: ${infoResult.error || 'Unknown'}`, 'error');
                return;
            }
            const storyData = infoResult.data;
            setCurrentStory(storyData);
            addLog(`Đã lấy thông tin: ${storyData.name}`, 'success');

            // 2. Save Story
            addLog('Đang lưu truyện...', 'info');
            const saveRes = await fetch('/api/crawler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save-story', storyData })
            });
            const saveResult = await saveRes.json();

            if (!saveResult.success) {
                addLog(`Lỗi lưu truyện: ${saveResult.error}`, 'error');
                return;
            }
            const storyId = saveResult.data.id;
            addLog(`Đã lưu truyện ID: ${storyId}`, 'success');

            // 3. Fetch Chapter List
            addLog('Đang lấy danh sách chương...', 'info');
            const chapRes = await fetch('/api/crawler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    action: 'fetch-chapters',
                    storyName: storyData.name,
                    storyAuthor: storyData.author
                })
            });
            const chapResult = await chapRes.json();

            if (!chapResult.success) {
                addLog(`Lỗi lấy chương: ${chapResult.error}`, 'error');
                return;
            }
            const chapterList = chapResult.data;
            setChapters(chapterList);
            addLog(`Tìm thấy ${chapterList.length} chương. Bắt đầu cào nội dung...`, 'info');

            // 4. Crawl Content
            let successCount = 0;
            const initialStatus = chapterList.reduce((acc: any, _: any, i: number) => ({ ...acc, [i]: 'pending' }), {});
            // Update status for existing chapters immediately for UI feedback
            chapterList.forEach((c: any, i: number) => {
                if (c.exists) initialStatus[i] = 'exists';
            });
            setProcessingChapters(initialStatus);

            for (let i = 0; i < chapterList.length; i++) {
                if (chapterList[i].exists) {
                    continue;
                }
                const success = await processChapter(storyId, chapterList[i], i);
                if (success) successCount++;
                // Small delay
                await new Promise(r => setTimeout(r, 200));
            }

            addLog(`Hoàn tất "${storyData.name}". Cào mới: ${successCount} chương.`, 'success');

        } catch (error) {
            addLog(`Lỗi không xác định: ${(error as any).message}`, 'error');
        }
    };

    const handleBatchProcess = async () => {
        if (!urls.trim()) return;
        setIsProcessing(true);
        setLogs([]);
        addLog('Bắt đầu quy trình cào hàng loạt...');

        const urlList = urls.split('\n').map(u => u.trim()).filter(u => u);
        addLog(`Tìm thấy ${urlList.length} liên kết cần xử lý.`);

        for (const url of urlList) {
            await processSingleUrl(url);
            addLog('----------------------------------------');
        }

        setIsProcessing(false);
        addLog('Hoàn tất toàn bộ quy trình!', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Crawl Truyện (Batch Mode)</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách Link Truyện</CardTitle>
                            <CardDescription>Nhập mỗi link trên một dòng. Hỗ trợ truyenfull.vision</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="https://truyenfull.vision/truyen-1/&#10;https://truyenfull.vision/truyen-2/"
                                className="min-h-[200px] font-mono text-sm"
                                value={urls}
                                onChange={(e) => setUrls(e.target.value)}
                                disabled={isProcessing}
                            />
                            <Button
                                className="w-full"
                                onClick={handleBatchProcess}
                                disabled={isProcessing || !urls.trim()}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Bắt đầu Cào
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="h-[400px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Nhật ký xử lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <div className="h-full overflow-y-auto p-4 space-y-2 font-mono text-xs bg-slate-950 text-slate-300">
                                {logs.length === 0 && <span className="text-slate-600 italic">Chưa có nhật ký...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                                        }`}>
                                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {currentStory ? (
                        <div className="space-y-6">
                            <Card className="overflow-hidden border-2 border-slate-100">
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-32 aspect-[2/3] relative bg-slate-100 shrink-0">
                                        <img
                                            src={currentStory.image || '/images/default_cover.jpg'}
                                            alt={currentStory.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 space-y-2">
                                        <Badge variant="outline" className="mb-2">Đang xử lý</Badge>
                                        <h3 className="text-lg font-bold">{currentStory.name}</h3>
                                        <p className="text-sm text-slate-500">{currentStory.author}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentStory.categories.map((c, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm">Tiến độ chương ({chapters.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[500px] overflow-y-auto border-t">
                                        <Table>
                                            <TableHeader className="bg-slate-50 sticky top-0">
                                                <TableRow>
                                                    <TableHead className="w-[60px] text-xs">#</TableHead>
                                                    <TableHead className="text-xs">Tên chương</TableHead>
                                                    <TableHead className="w-[80px] text-xs text-right">Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {chapters.map((chap, i) => (
                                                    <TableRow key={i} className="h-8">
                                                        <TableCell className="py-1 text-xs text-slate-500">{i + 1}</TableCell>
                                                        <TableCell className="py-1 text-xs truncate max-w-[200px]" title={chap.title}>{chap.title}</TableCell>
                                                        <TableCell className="py-1 text-xs text-right">
                                                            {processingChapters[i] === 'loading' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                                                            {processingChapters[i] === 'success' && <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto" />}
                                                            {processingChapters[i] === 'exists' && <CheckCircle2 className="h-3 w-3 text-blue-500 ml-auto" />}
                                                            {processingChapters[i] === 'error' && <AlertCircle className="h-3 w-3 text-red-500 ml-auto" />}
                                                            {(!processingChapters[i] || processingChapters[i] === 'pending') && <span className="text-slate-300">-</span>}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-lg min-h-[400px]">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p>Đang chờ xử lý...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
