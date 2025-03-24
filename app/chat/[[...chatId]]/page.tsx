"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useChatRouter } from "@/lib/chatRouter";
import { chatDB } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import ChatContent from "./chat-content";
import ChatForm from "./chat-form";
import { toast } from "sonner";

export default function ChatPage() {
  const { threadId, navigateToChat } = useChatRouter();
  const { state, isMobile } = useSidebar();

  const thread = useLiveQuery(async () => {
    if (threadId !== "") {
      const _thread = await chatDB.getThread(threadId);
      if (!_thread) {
        navigateToChat("");
      }
      return _thread;
    }
  }, [threadId]);
  const messages = useLiveQuery(() => {
    return chatDB.getAllMessages(threadId);
  }, [threadId]);

  const checkoutMutation = useMutation<{
    redirectTo: string;
  }>({
    mutationFn: async () => {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnTo: window.location.href }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      return response.json();
    },
    onError: () => {
      toast.error("Failed to create checkout session");
    },
    onSuccess: (data) => {
      console.log(data);
      // Redirect to the checkout page
      window.location.href = data.redirectTo;
    },
  });

  return (
    <>
      <header className="flex py-2 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3 w-full">
          {(state === "collapsed" || isMobile) && (
            <>
              <SidebarTrigger />
              <Button
                variant="ghost"
                className="w-7 h-7"
                onClick={() => navigateToChat("")}
              >
                <Plus />
              </Button>
              <Separator orientation="vertical" className="mr-2 h-4" />
            </>
          )}
          {thread?.title || "New Chat"}
          <div className="flex-grow"></div>
          <ThemeSwitcher />
        </div>
      </header>
      <div className="relative flex w-full flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto pb-48">
          <div
            role="log"
            aria-label="Chat messages"
            className="mx-auto max-w-4xl p-4 flex flex-col gap-4"
          >
            {messages?.map((message) => (
              <div
                key={message.id}
                className={cn([
                  `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
                  message.status === "error" &&
                    "bg-red-500/5 text-red-800 dark:text-red-200",
                ])}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-xl text-left p-2 ${message.role === "user" ? "bg-accent" : ""}`}
                >
                  {message.status == "error" ? (
                    <div>{message.content}</div>
                  ) : (
                    <ChatContent message={message} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 w-full px-4">
          <div className="mx-auto max-w-4xl my-4 rounded-xl border border-red-400/20 bg-red-300/10 px-5 py-3 text-red-800 shadow-lg backdrop-blur-md dark:border-red-800/20 dark:bg-red-700/20 dark:text-red-200 w-full">
            You&apos;ve reached the message limit. &nbsp;
            <Button
              variant="link"
              className="p-0"
              onClick={() => checkoutMutation.mutate()}
            >
              Subscribe to continue chatting.
            </Button>
          </div>
          <ChatForm
            threadId={threadId}
            defaultModel={thread?.model}
            defaultModelParams={thread?.modelParams}
          />
        </div>
      </div>
    </>
  );
}
