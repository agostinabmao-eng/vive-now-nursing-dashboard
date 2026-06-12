import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        vivenowgreen: "#22C55E",
        vivenowyellow: "#F0B323",
        vivenowred: "#EF4444",
      },
    },
  },
  plugins: [],
};

export default config;
