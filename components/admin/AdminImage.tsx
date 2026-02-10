'use client';

import { useState } from 'react';

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
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setImgSrc(fallback)}
        />
    );
}
