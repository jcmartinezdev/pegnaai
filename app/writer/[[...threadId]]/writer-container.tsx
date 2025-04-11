"use client";

import AppHeader from "@/components/app-header";
import { SyncDataContext } from "@/components/sync-data-provider";
import { useThreadRouter } from "@/components/thread-router";
import processPegnaAIStream from "@/lib/ai/ask-chat";
import { AskModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import dynamic from "next/dynamic";
import { useCallback, useContext, useEffect, useState } from "react";
const WriterEditor = dynamic(() => import("./writer-editor"), { ssr: false });

export default function WriterContainer() {
  const { threadId, navigateToThread } = useThreadRouter();
  const [remainingLimits, setRemainingLimits] = useState<number | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [document, setDocument] = useState<string | undefined>();
  const syncEngine = useContext(SyncDataContext);

  const onEditorChange = useCallback(
    async (content?: string) => {
      await chatDB.threads.update(threadId, {
        document: content || "",
        updatedAt: new Date(),
        synced: 0,
      });
    },
    [threadId],
  );

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

  // Whenever the thread changes, we need to clear the document
  useEffect(() => {
    setDocument(undefined);
  }, [threadId]);

  useEffect(() => {
    // Only load the document data the first time
    if (!document) {
      setDocument(thread?.document || "");
    }
  }, [thread?.document]);

  return (
    <>
      <AppHeader thread={thread} />
      <div className="relative flex w-full flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto">
          <WriterEditor
            document={thread?.document || ""}
            proposedDiff={thread?.documentProposedDiff}
            onChange={onEditorChange}
          />
        </div>
      </div>
    </>
  );
}
