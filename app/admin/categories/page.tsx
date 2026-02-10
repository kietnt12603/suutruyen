import { getCategories } from '@/lib/api';
import CategoryList from '@/components/admin/CategoryList';

export default async function AdminCategories(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1');
    const pageSize = 5;

    const { data: allCategories, count: totalCategories } = await getCategories({
        page: currentPage,
        pageSize
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Thể loại</h2>
                    <p className="text-slate-500 text-sm">Danh sách và quản lý các thể loại truyện.</p>
                </div>
            </div>

            <CategoryList
                initialCategories={allCategories}
                totalCategories={totalCategories}
                currentPage={currentPage}
                pageSize={pageSize}
            />
        </div>
    );
}
