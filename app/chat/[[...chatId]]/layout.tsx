"use client";

import ChatSidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatRouterProvider } from "@/lib/chatRouter";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatRouterProvider>
      <SidebarProvider>
        <div className="relative w-full flex h-dvh bg-background text-foreground">
          <ChatSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </ChatRouterProvider>
  );
}
