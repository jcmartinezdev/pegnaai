import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-8 md:py-12 bg-muted/20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                <Sparkles className="h-6 w-6 text-primary relative z-10" />
              </div>
              <span className="text-lg font-bold">Pegna.ai</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next-generation AI tools engineered for performance and designed
              for humans.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/chat"
                  className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 transition-colors"
                >
                  Pegna Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/#products"
                  className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 transition-colors"
                >
                  Pegna Writer
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 mt-8 pt-8 border-t md:flex-row">
          <p className="text-center text-sm text-gray-500 md:text-left dark:text-gray-400">
            © 2025 Pegna.ai. All rights reserved.
          </p>
          <div className="flex gap-4"></div>
        </div>
      </div>
    </footer>
  );
}
