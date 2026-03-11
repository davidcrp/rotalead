/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/r/:path*',
        destination: 'http://localhost:3001/r/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
