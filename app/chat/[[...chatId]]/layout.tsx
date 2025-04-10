import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatRouterProvider } from "@/lib/chat/chatRouter";
import { auth0 } from "@/lib/auth0";
import DataProviders from "@/components/data-providers";
import AppSidebar from "@/components/sidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  return (
    <DataProviders userId={session?.user.sub}>
      <ChatRouterProvider>
        <SidebarProvider>
          <div className="relative w-full flex h-dvh bg-background text-foreground">
            <AppSidebar app="chat" user={session?.user} />
            <SidebarInset>{children}</SidebarInset>
          </div>
        </SidebarProvider>
      </ChatRouterProvider>
    </DataProviders>
  );
}
