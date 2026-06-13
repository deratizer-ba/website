import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Cover upload cez Server Actions (default 1 MB). */
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      { source: "/admin/obsah", destination: "/admin/content", permanent: false },
      {
        source: "/admin/obsah/kategoria/:categoryId/podkategoria/:subcategoryId",
        destination:
          "/admin/content/category/:categoryId/subcategory/:subcategoryId",
        permanent: false,
      },
      {
        source: "/admin/obsah/kategoria/:categoryId",
        destination: "/admin/content/category/:categoryId",
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    /** fill + object-cover v aspect-[2/3] potrebuje vyššie rozlíšenie než layout šírka. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 828],
  },
}

export default nextConfig
