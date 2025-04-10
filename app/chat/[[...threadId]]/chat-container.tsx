"use client";

import { chatDB } from "@/lib/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import ChatForm from "./chat-form";
import { useContext, useEffect, useState } from "react";
import processPegnaAIStream from "@/lib/ai/ask-chat";
import { AskModel } from "@/lib/ai/types";
import ChatLimitBanner from "./chat-limit-banner";
import ChatScrollContainer from "./chat-scroll-container";
import ChatSuggestions from "./chat-suggestions";
import { cn } from "@/lib/utils";
import ChatContent from "./chat-content";
import { SyncDataContext } from "@/components/sync-data-provider";
import { useThreadRouter } from "@/components/thread-router";
import AppHeader from "@/components/app-header";

type ChatContainerProps = {
  userPlan?: string;
  isLoggedIn: boolean;
};

export default function ChatContainer({
  isLoggedIn,
  userPlan,
}: ChatContainerProps) {
  const [remainingLimits, setRemainingLimits] = useState<number | undefined>();
  const [suggestion, setSuggestion] = useState<string | undefined>(undefined);
  const { threadId, navigateToThread } = useThreadRouter();
  const [isStreaming, setIsStreaming] = useState(false);
  const syncEngine = useContext(SyncDataContext);

  // When the user selects a new chat, let's clear the remaining limits
  useEffect(() => {
    setRemainingLimits(undefined);
  }, [threadId]);

  async function onProcessPegnaAIStream(ask: AskModel) {
    setIsStreaming(true);
    const response = await processPegnaAIStream(ask);
    setIsStreaming(false);
    // Sync after sending a message
    syncEngine?.start();
    // Set the remaining limits
    setRemainingLimits(response.remainingMessages);
  }

  const thread = useLiveQuery(async () => {
    if (threadId !== "") {
      const _thread = await chatDB.getThread(threadId);
      if (!_thread) {
        navigateToThread("");
      }
      return _thread;
    }
  }, [threadId]);

  const messages = useLiveQuery(() => {
    return chatDB.getAllMessagesForThread(threadId);
  }, [threadId]);

  function onSuggestionClick(suggestion: string) {
    setSuggestion(suggestion);
  }

  return (
    <>
      <AppHeader thread={thread} />
      <div className="relative flex w-full flex-1 flex-col overflow-hidden">
        <ChatScrollContainer messagesCount={messages?.length || 0}>
          {messages?.length === 0 && (
            <ChatSuggestions onSuggestionClick={onSuggestionClick} />
          )}
          {messages?.map((message, i) => (
            <div
              key={message.id}
              data-chat-id={message.id}
              className={cn([
                `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
                message.status === "error" &&
                  "bg-red-500/5 text-red-800 dark:text-red-200",
              ])}
            >
              <div
                className={cn(
                  "max-w-[80%] p-2 rounded-xl text-left p-2",
                  message.role === "user" && "bg-accent",
                  messages &&
                    messages.length > 2 &&
                    i === messages.length - 1 &&
                    "min-h-[calc(100vh-20rem)]",
                )}
              >
                {message.status == "error" ? (
                  <div>{message.content}</div>
                ) : (
                  <ChatContent message={message} />
                )}
              </div>
            </div>
          ))}
        </ChatScrollContainer>
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
            isStreaming={isStreaming}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            threadId={threadId}
            defaultText={suggestion}
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
