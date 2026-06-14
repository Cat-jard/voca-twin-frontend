import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: "http://localhost:9000/:path*",
      },
      {
        source: "/nuevo/:path*",
        destination: "http://localhost:8081/:path*",
      },
    ];
  },
};

export default nextConfig;
