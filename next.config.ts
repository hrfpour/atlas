import type { NextConfig } from "next";

// For GitHub Pages project sites (https://<owner>.github.io/<repo>/) we need a
// basePath equal to "/<repo>". Auto-detected from GITHUB_REPOSITORY (set by
// GitHub Actions), or set BASE_PATH explicitly.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const owner = process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "";
const basePath =
  process.env.BASE_PATH ||
  (repo && repo !== `${owner}.github.io` ? `/${repo}` : "");

// Static export only for production builds when STATIC_EXPORT=1 is set.
// This keeps `next dev` working normally (dev requires a server).
const isStaticBuild = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  images: { unoptimized: true },
  ...(isStaticBuild
    ? {
        output: "export" as const,
        ...(basePath ? { basePath } : {}),
      }
    : {
        output: "standalone" as const,
      }),
};

export default nextConfig;
