"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, LifeBuoy, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SettingsMenu() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="lg:w-1/5">
      <div className="space-y-4">
        <div className="lg:hidden w-full">
          <Select
            onValueChange={(value) => router.push(value)}
            defaultValue={pathname}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/settings/account">Account</SelectItem>
              <SelectItem value="/settings/usage">Usage</SelectItem>
              <SelectItem value="/settings/ai-experience">
                AI Experience
              </SelectItem>
              <SelectItem value="/settings/sync">Sync &amp; History</SelectItem>
              <SelectItem value="/settings/support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="px-3 py-2 hidden lg:block">
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
    </aside>
  );
}
