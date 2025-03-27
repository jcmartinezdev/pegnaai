"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useChatRouter } from "@/lib/chatRouter";
import { chatDB } from "@/lib/localDb";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import ChatContent from "./chat-content";
import ChatForm from "./chat-form";
import { useEffect, useState } from "react";
import processPegnaAIStream from "@/lib/chat/ask-chat";
import { AskModel } from "@/lib/chat/types";
import ChatLimitBanner from "./chat-limit-banner";

type ChatContainerProps = {
  isLoggedIn: boolean;
};

export default function ChatContainer({ isLoggedIn }: ChatContainerProps) {
  const [remainingLimits, setRemainingLimits] = useState<number | undefined>();
  const { threadId, navigateToChat } = useChatRouter();
  const { state, isMobile } = useSidebar();

  // When the user selects a new chat, let's clear the remaining limits
  useEffect(() => {
    setRemainingLimits(undefined);
  }, [threadId]);

  async function onProcessPegnaAIStream(ask: AskModel) {
    const response = await processPegnaAIStream(ask);
    setRemainingLimits(response.remainingMessages);
  }

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
          {remainingLimits === 0 && (
            <ChatLimitBanner
              isLoggedIn={isLoggedIn}
              message="You've reached the message limit."
            />
          )}
          {remainingLimits !== undefined &&
            remainingLimits <= 10 &&
            remainingLimits > 0 && (
              <ChatLimitBanner
                isLoggedIn={isLoggedIn}
                message={`You've ${remainingLimits} messages left.`}
              />
            )}

          <ChatForm
            threadId={threadId}
            defaultModel={thread?.model}
            defaultModelParams={thread?.modelParams}
            setRemainingLimits={setRemainingLimits}
            onProcessPegnaAIStream={onProcessPegnaAIStream}
          />
        </div>
      </div>
    </>
  );
}
