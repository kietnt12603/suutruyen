import HeaderWrapper from "@/components/HeaderWrapper";
import HeaderBottom from "@/components/HeaderBottom";
import Footer from "@/components/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HeaderWrapper />
            <HeaderBottom />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}
