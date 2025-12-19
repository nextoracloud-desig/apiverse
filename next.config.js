/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        outputFileTracingIncludes: {
            '/api/admin/run-import': ['./data/**/*'],
            '/api/cron/import': ['./data/**/*'],
        },
    },
};

module.exports = nextConfig;
