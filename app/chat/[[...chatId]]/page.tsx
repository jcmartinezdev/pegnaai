"use client";

import ChatForm from "@/components/ChatForm";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChatRouter } from "@/lib/chatRouter";
import { chatDB } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ChatPage() {
  const { threadId } = useChatRouter();

  const thread = useLiveQuery(() => {
    return chatDB.getThread(threadId);
  }, [threadId]);

  const messages = useLiveQuery(() => {
    return chatDB.getAllMessages(threadId);
  }, [threadId]);

  return (
    <>
      <header className="flex py-2 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {thread?.title || "New Chat"}
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
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-xl text-left p-2 ${message.role === "user" ? "bg-accent" : ""}`}
                >
                  {message.content} - {message.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 w-full pr-2">
          <ChatForm threadId={threadId} />
        </div>
      </div>
    </>
  );
}
