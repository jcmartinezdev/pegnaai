import { Button } from "@/components/ui/button";
import { models } from "@/lib/db";
import { ArrowDown, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/5 via-primary/10 to-transparent -z-10 blur-3xl opacity-80"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-primary/5 via-primary/10 to-transparent -z-10 blur-3xl opacity-80"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 -z-10"></div>
      <div className="absolute top-20 left-[10%] w-12 h-12 rounded-full bg-primary/10 animate-float-slow -z-10"></div>
      <div className="absolute top-40 right-[15%] w-20 h-20 rounded-full bg-primary/10 animate-float -z-10"></div>
      <div className="absolute bottom-20 left-[20%] w-16 h-16 rounded-full bg-primary/5 animate-float-reverse -z-10"></div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-[10%] w-32 h-32 rounded-full border border-primary/20 animate-spin-slow opacity-30 -z-10"></div>
      <div className="absolute bottom-1/4 left-[10%] w-24 h-24 rounded-full border border-primary/20 animate-spin-slow opacity-30 -z-10"></div>

      <div className="container px-4 md:px-6 relative mx-auto">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 shadow-lg shadow-primary/10 mb-2 animate-pulse-slow relative">
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping"></div>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl text-shadow-sm">
            <span className="text-gradient dark:from-white dark:via-gray-200 dark:to-gray-300">
              Next-Generation AI Tools for Everyone
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 leading-relaxed">
            Let advanced AI solutions transform your workday. Whether it&apos;s
            real-time chat assistance or smart content generation,
            PegnaAI&apos;s tools empower you to explore new realms of
            innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
            <Button size="lg" className="group" asChild>
              <Link href="/chat">
                Try Pegna Chat Now
                <MessageSquare className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group" asChild>
              <Link href="#products">
                Explore More
                <ArrowDown className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-4 rounded-xl glass-effect">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
              {Object.keys(models).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Specialized AI Models
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl glass-effect">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
              No
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Skills Required
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl glass-effect">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
              1K+
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Active Users
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl glass-effect">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
              24/7
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Always Available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
