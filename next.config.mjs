/** @type {import('next').NextConfig} */
// Static export: the whole app is plain files, so it can be hosted anywhere
// (Vercel) and cached completely for offline use by public/sw.js.
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
