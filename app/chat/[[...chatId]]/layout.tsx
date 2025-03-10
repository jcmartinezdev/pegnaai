"use client";

import Sidebar from "@/components/sidebar";
import { ChatRouterProvider } from "@/lib/chatRouter";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatRouterProvider>
      <div className="relative flex h-dvh bg-background text-foreground">
        <Sidebar />
        {children}
      </div>
    </ChatRouterProvider>
  );
}
