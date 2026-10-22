import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el botón "N" de las herramientas de desarrollo de Next.js.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};

export default nextConfig;
