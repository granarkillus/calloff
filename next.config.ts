import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This site moved into portal.xing.wtf/calloff. Old links and bookmarks
  // (including ?id= links sent to officers) land on the same page there.
  async redirects() {
    return [
      { source: "/", destination: "https://portal.xing.wtf/calloff", permanent: false },
      { source: "/:path((?!api/).*)", destination: "https://portal.xing.wtf/calloff/:path", permanent: false },
    ];
  },
};

export default nextConfig;
