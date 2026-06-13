import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fija la raíz del workspace a este proyecto (hay un package-lock.json
  // huérfano en la carpeta superior que confundía a la detección de raíz).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
