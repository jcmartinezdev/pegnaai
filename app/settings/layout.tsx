import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  ChevronLeft,
  CreditCard,
  LifeBuoy,
  Settings,
  User,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/chat">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to App
          </Link>
        </Button>
        <div className="flex-grow"></div>
        <ThemeSwitcher />
      </div>

      {/* Usage Summary - Always visible */}
      <div className="mb-6 rounded-lg border bg-background p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium">Usage Summary</h2>
          <Link
            href="/settings/usage"
            className="text-sm text-primary hover:underline"
          >
            View Details
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Messages</span>
              <span className="font-medium">1,045 / 1,500</span>
            </div>
            <Progress value={70} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>70% used</span>
              <span>455 remaining</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Premium Models</span>
              <span className="font-medium">87 / 200</span>
            </div>
            <Progress value={43} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>43% used</span>
              <span>113 remaining</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="lg:w-1/5">
          <ScrollArea className="h-[calc(100vh-280px)] pr-6">
            <div className="space-y-4">
              <div className="px-3 py-2">
                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-base transition-all hover:bg-muted"
                    asChild
                  >
                    <Link href="/settings/account">
                      <User className="mr-3 h-5 w-5 text-muted-foreground" />
                      Account
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-base transition-all hover:bg-muted"
                    asChild
                  >
                    <Link href="/settings/usage">
                      <BarChart className="mr-3 h-5 w-5 text-muted-foreground" />
                      Usage
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-base transition-all hover:bg-muted"
                    asChild
                  >
                    <Link href="/settings/ai-experience">
                      <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
                      AI Experience
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-base transition-all hover:bg-muted"
                    asChild
                  >
                    <Link href="/settings/sync">
                      <User className="mr-3 h-5 w-5 text-muted-foreground" />
                      Sync &amp; History
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-base transition-all hover:bg-muted"
                    asChild
                  >
                    <Link href="/settings/support">
                      <LifeBuoy className="mr-3 h-5 w-5 text-muted-foreground" />
                      Support
                    </Link>
                  </Button>
                </nav>
              </div>
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
