/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["pino-pretty"] = false;
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [      {
        protocol: "https",
        hostname: 'gateway.pinata.cloud',
        port: "",
        pathname: '/ipfs/**',
      },
      {
        protocol: "https",
        hostname: 'ipfs.io',
        port: "",
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // Untuk UploadThing
      },
      {
        protocol: "https",
        hostname: 'api.dicebear.com', // Avatar, dsb.
      },
      {
        protocol: "https",
        hostname: 'i.pravatar.cc',
        port: "",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: 'placehold.co',
        port: "",
        pathname: '/**',
      },
    ],
  },

  // Tambahkan baris ini untuk skip lint & type error (Next.js 13+)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;