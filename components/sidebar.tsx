"use client";

import { MessageSquare, NotebookPen } from "lucide-react";
import { Button } from "./ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDB } from "@/lib/db";
import { useEffect } from "react";
import { useChatRouter } from "@/lib/chatRouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export default function ChatSidebar() {
  const { threadId, navigateToChat } = useChatRouter();

  const threads = useLiveQuery(() => {
    return chatDB.getAllThreads();
  });

  useEffect(() => {
    if (threads && threads.length === 0) {
      chatDB.createrOnboardingThreads();
    }
  }, [threads]);

  return (
    <Sidebar>
      <SidebarHeader className="flex py-2 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center justify-between w-full gap-2 px-3">
          <h1>Next Chat</h1>
          <Button
            variant="ghost"
            className="w-7 h-7"
            onClick={() => navigateToChat("")}
          >
            <NotebookPen />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {threads?.map((thread) => (
              <SidebarMenuItem key={thread.id} data-thread-id={thread.id}>
                <SidebarMenuButton
                  onClick={() => navigateToChat(thread.id)}
                  isActive={thread.id === threadId}
                  className="w-full justify-start"
                >
                  <MessageSquare className="w-6 h-6" />
                  {thread.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex w-full items-center justify-center gap-3 p-4">
          Juan
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
