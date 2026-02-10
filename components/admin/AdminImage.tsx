import { useState } from 'react';
import Image from 'next/image';

interface AdminImageProps {
    src: string | undefined | null;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    fallback?: string;
}

export default function AdminImage({
    src,
    alt,
    className,
    style,
    fallback = 'https://via.placeholder.com/150x220?text=No+Image'
}: AdminImageProps) {
    const [imgSrc, setImgSrc] = useState(src || fallback);

    return (
        <div className={`relative ${className}`} style={style}>
            <Image
                src={imgSrc}
                alt={alt}
                fill
                className="object-cover"
                onError={() => setImgSrc(fallback)}
                unoptimized
            />
        </div>
    );
}
