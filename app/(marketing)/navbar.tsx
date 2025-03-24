import { Sparkles } from "lucide-react";
import Link from "next/link";
import NavbarLoginButton from "./navbar-login-button";
import { Suspense } from "react";

export default function NavBar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
            <Sparkles className="h-6 w-6 text-primary relative z-10" />
          </div>
          <span className="text-xl font-bold">Pegna.ai</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="#products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Products
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <NavbarLoginButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
