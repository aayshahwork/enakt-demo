/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/signin", permanent: false },
      { source: "/calloway/:path*", destination: "/kestrel", permanent: false },
      { source: "/ashcombe/:path*", destination: "/kestrel", permanent: false },
      { source: "/northfield/:path*", destination: "/kestrel", permanent: false },
    ]
  },
}
export default nextConfig
