import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        404 - Page Not Found
      </h1>
      <p>Not sure how you got here, but nothing&apos;s here.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </main>
  );
}
