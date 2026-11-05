/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/calloway", permanent: false },
      { source: "/ashcombe/:path*", destination: "/calloway", permanent: false },
      { source: "/northfield/:path*", destination: "/calloway", permanent: false },
    ]
  },
}
export default nextConfig
