/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Konfigurasi webpack Anda tetap sama
    config.resolve.alias["pino-pretty"] = false;
    return config;
  },
  images: {
    // PERBAIKAN 1: Izinkan pemuatan SVG dari remote URL
    dangerouslyAllowSVG: true,
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'ipfs.io',
        port: "",
        pathname: '/ipfs/**',
      },
    ],
    // PERBAIKAN 2: Hapus kunci 'domains' yang sudah usang
  },
};

module.exports = nextConfig;