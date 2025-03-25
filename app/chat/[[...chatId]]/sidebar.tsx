"use client";

import { MessageSquare, Plus } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDB } from "@/lib/localDb";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User } from "@auth0/nextjs-auth0/types";
import Link from "next/link";

type ChatSidebarProps = {
  user?: User;
};

export default function ChatSidebar({ user }: ChatSidebarProps) {
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
                  <span className="truncate">{thread.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex w-full items-center justify-center gap-3 p-y-4">
          {user ? (
            <Button
              variant="ghost"
              className="flex items-center justify-start w-full gap-x-4"
              asChild
            >
              <Link href="/settings">
                {user.picture && (
                  <img
                    alt="The user profile's picture"
                    className="size-8 rounded-full bg-primary/10"
                    src={user.picture}
                  />
                )}
                <span className="truncate">{user.name}</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost">Log in</Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
