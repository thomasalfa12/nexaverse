/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Jangan bundel modul ini di browser
    config.resolve.alias["pino-pretty"] = false;
    return config;
  },
  images: {
   
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**", // semua path
      },
    ],
    domains: ["images.unsplash.com"],
  },
};
module.exports = nextConfig;
