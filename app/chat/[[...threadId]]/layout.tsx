import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth0 } from "@/lib/auth0";
import DataProviders from "@/components/data-providers";
import AppSidebar from "@/components/sidebar";
import { ThreadRouterProvider } from "@/components/thread-router";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  return (
    <DataProviders userId={session?.user.sub}>
      <ThreadRouterProvider>
        <SidebarProvider>
          <div className="relative w-full flex h-dvh bg-background text-foreground">
            <AppSidebar user={session?.user} />
            <SidebarInset>{children}</SidebarInset>
          </div>
        </SidebarProvider>
      </ThreadRouterProvider>
    </DataProviders>
  );
}
