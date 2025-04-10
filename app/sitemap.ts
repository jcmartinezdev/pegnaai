import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import matter from "gray-matter";

function getMarketingPages(): MetadataRoute.Sitemap {
  // Get all marketing pages
  const contentDir = path.join(process.cwd(), "content/marketing");

  try {
    const files = fs.readdirSync(contentDir);
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => {
        const filePath = path.join(
          process.cwd(),
          "content/marketing/",
          `${file}`,
        );
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data } = matter(fileContent);
        return {
          url: `${process.env.APP_BASE_URL}/${file.replace(/\.mdx$/, "")}`,
          lastModified: data.lastUpdated || new Date(),
          changeFrequency: "yearly",
          priority: 1,
        };
      });
  } catch (error) {
    console.error("Error reading content directory:", error);
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.APP_BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...getMarketingPages(),
  ];
}
