import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*", "./content/**/*", "./.source/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  // Headers for the runtime-ESM chart registry served from
  // `public/dist/charts/`. Treated like a public CDN (esm.sh / unpkg
  // pattern): open CORS so any host page can `await import()` the
  // bundle, and aggressive cache on content-hashed filenames so the
  // browser never re-downloads the same version twice.
  async headers() {
    const cors = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
      // CORP keeps the asset loadable from cross-origin host pages
      // even when those pages set `Cross-Origin-Embedder-Policy`.
      { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
    ]
    return [
      // Catch-all default for `/dist/charts/`. Short revalidating
      // cache so pointer files (`<kind>-latest.json`, `index.json`)
      // surface new versions promptly.
      {
        source: "/dist/charts/:path*",
        headers: [
          ...cors,
          {
            key: "Cache-Control",
            value: "public, max-age=60, must-revalidate",
          },
        ],
      },
      // Override for content-hashed artefacts (the .mjs bundle, its
      // sourcemap, and the per-version sidecar JSON). The 10-char
      // sha256 prefix in the filename means the URL changes whenever
      // the source changes, so the asset is safe to cache forever.
      // Order matters: this must follow the catch-all so its
      // `Cache-Control` wins (Next applies header rules in array
      // order with later overriding earlier on the same key).
      {
        source:
          "/dist/charts/:file(.+-[a-f0-9]{10}\\.(?:mjs|mjs\\.map|json))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  redirects() {
    return [
      {
        source: "/components",
        destination: "/docs/components",
        permanent: true,
      },
      {
        source: "/docs/primitives/:path*",
        destination: "/docs/components/:path*",
        permanent: true,
      },
      {
        source: "/figma",
        destination: "/docs/figma",
        permanent: true,
      },
      {
        source: "/docs/forms",
        destination: "/docs/components/form",
        permanent: false,
      },
      {
        source: "/docs/forms/react-hook-form",
        destination: "/docs/components/form",
        permanent: false,
      },
      {
        source: "/sidebar",
        destination: "/docs/components/sidebar",
        permanent: true,
      },
      {
        source: "/react-19",
        destination: "/docs/react-19",
        permanent: true,
      },
      {
        source: "/charts",
        destination: "/charts/area",
        permanent: true,
      },
      {
        source: "/view/styles/:style/:name",
        destination: "/view/:name",
        permanent: true,
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/docs/:path*.md",
        permanent: true,
      },
      {
        source: "/mcp",
        destination: "/docs/mcp",
        permanent: false,
      },
    ]
  },
  rewrites() {
    return [
      {
        source: "/docs/:path*.md",
        destination: "/llm/:path*",
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
