import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pegna AI",
    short_name: "pegna ai",
    description: "The best chatbot in the world.",
    start_url: "/chat",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
