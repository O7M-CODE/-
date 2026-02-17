/** @type {import('next').NextConfig} */
// env configured via .env.local
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
