"use client";

import { useChatRouter } from "@/lib/chatRouter";
import { chatDB } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ChatPage() {
  const { threadId } = useChatRouter();

  const messages = useLiveQuery(() => {
    return chatDB.getAllMessages(threadId);
  }, [threadId]);

  return (
    <main className="relative flex w-full flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div
          role="log"
          aria-label="Chat messages"
          className="mx-auto max-w-4xl p-4"
        >
          {messages?.map((message) => (
            <div key={message.id} className="flex gap-2">
              <div>{message.role}:</div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 w-full pr-2">Form</div>
    </main>
  );
}
