"use client";

import AppHeader from "@/components/app-header";
import { SyncDataContext } from "@/components/sync-data-provider";
import { useThreadRouter } from "@/components/thread-router";
import { WriterModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import dynamic from "next/dynamic";
import { useCallback, useContext, useEffect, useState } from "react";
import WriterNewDocumentForm from "./writer-new-document-form";
import WriterUpdateDocumentForm from "./writer-update-document-form";
import { askPegnaAIToGenerateText } from "@/lib/ai/ask-chat";
import { SelectionRange, Statistics } from "@uiw/react-codemirror";
const WriterEditor = dynamic(() => import("./writer-editor"), { ssr: false });

export default function WriterContainer() {
  const { threadId, navigateToThread } = useThreadRouter();
  const [remainingLimits, setRemainingLimits] = useState<number | undefined>();
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [document, setDocument] = useState<string | undefined>();
  const syncEngine = useContext(SyncDataContext);

  const onEditorStatsChange = useCallback(
    (data: Statistics) => {
      if (data.selectionCode.length > 0) {
        setSelectionRange(data.selectionAsSingle);
      } else {
        setSelectionRange(null);
      }
    },
    [setSelectionRange],
  );

  const onEditorChange = useCallback(
    async (content?: string) => {
      const thread = await chatDB.getThread(threadId);
      const diff =
        thread?.documentProposedDiff === content
          ? ""
          : thread?.documentProposedDiff;
      await chatDB.threads.update(threadId, {
        document: content || "",
        documentProposedDiff: diff,
        updatedAt: new Date(),
        synced: 0,
      });
    },
    [threadId],
  );

  const onRejectProposal = useCallback(async () => {
    await chatDB.threads.update(threadId, {
      documentProposedDiff: "",
      updatedAt: new Date(),
      synced: 0,
    });
  }, [threadId]);

  async function onGenerateText(ask: WriterModel) {
    setIsStreaming(true);
    const response = await askPegnaAIToGenerateText(ask);
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
        {threadId ? (
          <>
            <div className="overflow-y-auto pt-4 md:pt-8 pb-32">
              <WriterEditor
                isStreaming={isStreaming}
                document={thread?.document || ""}
                proposedDiff={thread?.documentProposedDiff}
                onChange={onEditorChange}
                onRejectProposal={onRejectProposal}
                onStatsChange={onEditorStatsChange}
              />
              <WriterUpdateDocumentForm
                selectionRange={selectionRange}
                isStreaming={isStreaming}
                onGenerateText={onGenerateText}
              />
            </div>
          </>
        ) : (
          <WriterNewDocumentForm
            isStreaming={isStreaming}
            onGenerateText={onGenerateText}
          />
        )}
      </div>
    </>
  );
}
