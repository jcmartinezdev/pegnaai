import {
  ArrowRight,
  MessageSquare,
  Pen,
  Zap,
  Shield,
  Sparkles,
  Star,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "./hero-section";
import ProductCard from "./product-card";
import { LlmModel, models } from "@/lib/chat/types";
import ModelIcon from "@/components/model-icon";

export default function Home() {
  return (
    <div>
      <main className="flex-1">
        <HeroSection />

        {/* Products Section - Enhanced */}
        <section
          id="products"
          className="w-full py-16 md:py-24 relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5 -z-10"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent -z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent -z-10"></div>

          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2 relative">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                <Star className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl/16 text-gradient">
                Our Tools
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Powerful AI tools tailored to your needs
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              <ProductCard
                ProductIcon={MessageSquare}
                productName="Pegna Chat"
                tag="Available Now"
                description="Lightning-fast AI conversations with models tailored to your exact needs. Accessible for everyone, powerful for anything."
                characteristics={Object.keys(models).map((model) => ({
                  Icon: (
                    <ModelIcon className="h-4 w-4" model={model as LlmModel} />
                  ),
                  label: models[model as LlmModel].name,
                }))}
                cta={{
                  label: "Try Pegna Chat Now",
                  url: "/chat",
                  Icon: MessageSquare,
                }}
              />

              <ProductCard
                ProductIcon={Pen}
                productName="Pegna Writer"
                tag="Coming Soon"
                description="The world's first AI-first markdown writer. Engineered for performance, perfect first drafts, and lightning-fast edits."
                characteristics={[
                  {
                    Icon: <Pen className="h-4 w-4" />,
                    label: "First Drafts",
                  },
                  {
                    Icon: <Pen className="h-4 w-4" />,
                    label: "Editorial Magic",
                  },
                  {
                    Icon: <Pen className="h-4 w-4" />,
                    label: "Markdown Native",
                  },
                  {
                    Icon: <Pen className="h-4 w-4" />,
                    label: "Performance",
                  },
                ]}
                cta={{
                  label: "Join the Waitlist",
                  url: "/chat",
                  Icon: Pen,
                }}
              />
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section
          id="features"
          className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/30 to-muted/50 relative overflow-hidden"
        >
          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2 relative">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl/16 text-gradient">
                Why Choose Pegna.ai?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Engineered for performance, designed for humans
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-4 rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="rounded-full bg-primary/10 p-3 shadow-md relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Ultra Fast</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Get instant responses with our lightning-fast AI technology.
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>50ms average response time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Optimized for real-time interactions</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="rounded-full bg-primary/10 p-3 shadow-md relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Easy to Use</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Designed for everyone, not just experts. No technical
                  knowledge required.
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Intuitive user interface</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Guided experiences for new users</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="rounded-full bg-primary/10 p-3 shadow-md relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Intelligent</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Advanced AI that understands context and provides relevant,
                  helpful responses.
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>State-of-the-art AI models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Continuous learning and improvement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Enhanced */}
        <section
          id="testimonials"
          className="w-full py-16 md:py-24 relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-dot-pattern opacity-5 -z-10"></div>
          <div className="absolute top-1/3 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2 relative">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                <Star className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl/16 text-gradient">
                What Our Users Say
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Don&apos;t just take our word for it
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col justify-between rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl -mr-10 -mt-10 opacity-70"></div>
                <div className="space-y-4 relative">
                  <div className="flex gap-1">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    &quot;Pegna Chat has completely transformed how I interact
                    with AI. It&apos;s incredibly fast and understands exactly
                    what I&apos;m asking.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-primary/10">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary font-medium">
                    SJ
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Marketing Director
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl -mr-10 -mt-10 opacity-70"></div>
                <div className="space-y-4 relative">
                  <div className="flex gap-1">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    &quot;As someone who&apos;s not tech-savvy, I was amazed at
                    how easy Pegna Chat is to use. It&apos;s like talking to a
                    helpful friend.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-primary/10">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary font-medium">
                    MC
                  </div>
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Small Business Owner
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl glass-card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl -mr-10 -mt-10 opacity-70"></div>
                <div className="space-y-4 relative">
                  <div className="flex gap-1">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    &quot;The speed and accuracy of Pegna Chat is unmatched.
                    It&apos;s become an essential tool for my daily work.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-primary/10">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary font-medium">
                    AR
                  </div>
                  <div>
                    <p className="font-medium">Alex Rivera</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Software Engineer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="w-full py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 -z-10"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-5 -z-10"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent -z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent -z-10"></div>

          {/* Animated Decorative Elements */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full border border-primary/20 animate-spin-slow opacity-30 -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full border border-primary/20 animate-spin-slow opacity-30 -z-10"></div>

          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 shadow-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32 opacity-70"></div>

              <div className="flex flex-col items-center justify-center space-y-4 text-center relative">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-2 shadow-md relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75"></div>
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl/16 text-shadow-sm">
                  Experience AI That Actually Delivers
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                  Join thousands of users who&apos;ve upgraded their
                  productivity with Pegna.ai&apos;s cutting-edge technology.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row mt-6">
                  <Button
                    size="lg"
                    className="gap-1.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      Get started for free
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 bg-primary group-hover:bg-primary/90 transition-colors duration-300"></span>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/5 transition-all group"
                  >
                    <span className="flex items-center gap-1.5">
                      Schedule a demo
                      <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
