import Header from '@/components/Header';
import HeaderMobile from '@/components/HeaderMobile';
import { getCategories } from '@/lib/api';

export default async function HeaderWrapper() {
    const { data: categories } = await getCategories();

    return (
        <>
            <Header categories={categories} />
            <HeaderMobile categories={categories} />
        </>
    );
}
