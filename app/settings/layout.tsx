import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserUsageSummary from "./user-usage-summary";
import SettingsMenu from "./settings-menu";
import { ChevronLeft, LogOut } from "lucide-react";
import { logOut } from "@/lib/auth/utils";
import DataProviders from "@/components/data-providers";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <DataProviders userId={session?.user.sub}>
      <div className="container mx-auto mb-10">
        <div className="mb-6 flex items-center pt-4 md:pt-10 px-4 md:px-0">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/chat">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
          <div className="flex-grow"></div>
          <div className="flex space-x-2">
            <ThemeSwitcher />
            <Button variant="destructive" size="sm" onClick={logOut}>
              <LogOut />
              Log out
            </Button>
          </div>
        </div>

        <UserUsageSummary />

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 mx-4">
          <SettingsMenu />
          <div className="flex-1 lg:max-w-3xl">{children}</div>
        </div>
      </div>
    </DataProviders>
  );
}
