/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/ashcombe", permanent: false },
      { source: "/northfield/:path*", destination: "/ashcombe", permanent: false },
    ]
  },
}
export default nextConfig
