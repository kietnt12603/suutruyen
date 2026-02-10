/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'suustore.com',
            },
            {
                protocol: 'https',
                hostname: 'truyenfull.vision',
            },
            {
                protocol: 'https',
                hostname: 'static.truyenfull.vision',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
}

export default nextConfig
