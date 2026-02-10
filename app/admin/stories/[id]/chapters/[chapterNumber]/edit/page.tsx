import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoryById, getChapter } from '@/lib/api';
import ChapterForm from '@/components/admin/ChapterForm';

export default async function EditChapter(props: {
    params: Promise<{ id: string, chapterNumber: string }>
}) {
    const params = await props.params;
    const id = parseInt(params.id);
    const chapterNumber = parseInt(params.chapterNumber);

    if (isNaN(id) || isNaN(chapterNumber)) {
        notFound();
    }

    const [story, chapter] = await Promise.all([
        getStoryById(id),
        getChapter(id, chapterNumber)
    ]);

    if (!story || !chapter) {
        notFound();
    }

    return (
        <div className="admin-edit-chapter">
            <div className="mb-4">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link href="/admin/stories">Quản lý Truyện</Link></li>
                        <li className="breadcrumb-item"><Link href={`/admin/stories/${id}/edit`}>{story.name}</Link></li>
                        <li className="breadcrumb-item"><Link href={`/admin/stories/${id}/chapters`}>Danh sách chương</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">Sửa chương {chapterNumber}</li>
                    </ol>
                </nav>
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold mb-0">Sửa Chương {chapterNumber}</h2>
                    <div className="small text-muted">Truyện: <span className="fw-bold">{story.name}</span></div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <ChapterForm story={story} chapter={chapter} />
                </div>
            </div>
        </div>
    );
}
