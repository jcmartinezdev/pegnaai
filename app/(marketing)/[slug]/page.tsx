import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/markdown-content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "content/marketing");

  try {
    const files = fs.readdirSync(contentDir);
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => ({
        slug: file.replace(/\.mdx$/, ""),
      }));
  } catch (error) {
    console.error("Error reading content directory:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log("Generating metadata for slug:", slug);
  const filePath = path.join(
    process.cwd(),
    "content/marketing/",
    `${slug}.mdx`,
  );

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContent);

    return {
      title: data.title || slug,
      description: data.description || "",
    };
  } catch {
    return {
      title: slug,
      description: "",
    };
  }
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log("Generating page for slug:", slug);
  const filePath = path.join(
    process.cwd(),
    "content/marketing/",
    `${slug}.mdx`,
  );

  try {
    if (!fs.existsSync(filePath)) {
      notFound();
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(fileContent);

    return (
      <div className="max-w-2xl px-4 md:px-6 mx-auto py-8">
        <main className="prose dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
          <h1>{data.title}</h1>
          <div className="my-4">
            <span
              aria-label="Published date"
              className="text-gray-800 dark:text-gray-300"
            >
              Last Updated:{" "}
              {data.lastUpdated.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <MarkdownContent content={content} />{" "}
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
