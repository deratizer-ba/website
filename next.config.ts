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
  },
}

export default nextConfig
