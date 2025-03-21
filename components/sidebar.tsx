"use client";

import { MessageSquare, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDB } from "@/lib/db";
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
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";

export default function ChatSidebar() {
  const { threadId, navigateToChat } = useChatRouter();
  const { setOpenMobile } = useSidebar();

  const threads = useLiveQuery(() => {
    return chatDB.getAllThreads();
  });

  function switchToChat(threadId: string) {
    navigateToChat(threadId);
    setOpenMobile(false);
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex py-2 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center w-full gap-2 px-3">
          <SidebarTrigger />
          <h1>Pegna.ai</h1>
        </div>
        <Button className="w-full" onClick={() => switchToChat("")}>
          New Chat
          <Plus />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {threads?.map((thread) => (
              <SidebarMenuItem key={thread.id} data-thread-id={thread.id}>
                <SidebarMenuButton
                  onClick={() => switchToChat(thread.id)}
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
