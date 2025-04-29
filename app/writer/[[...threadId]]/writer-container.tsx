"use client";

import AppHeader from "@/components/app-header";
import { SyncDataContext } from "@/components/sync-data-provider";
import { useThreadRouter } from "@/components/thread-router";
import { documentTypes, PegnaDocument, WriterModel } from "@/lib/ai/types";
import { chatDB, ThreadModel } from "@/lib/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import dynamic from "next/dynamic";
import { useCallback, useContext, useEffect, useState } from "react";
import WriterNewDocumentForm from "./writer-new-document-form";
import WriterUpdateDocumentForm from "./writer-update-document-form";
import { askPegnaAIToGenerateText } from "@/lib/ai/ask-chat";
import { SelectionRange, Statistics } from "@uiw/react-codemirror";
import { Button } from "@/components/ui/button";
import ChatLimitBanner from "@/app/chat/[[...threadId]]/chat-limit-banner";
const WriterEditor = dynamic(() => import("./writer-editor"), { ssr: false });

export default function WriterContainer() {
  const { threadId, navigateToThread } = useThreadRouter();
  const [remainingLimits, setRemainingLimits] = useState<number | undefined>();
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [repurposeDocumentType, setRepurposeDocumentType] =
    useState<PegnaDocument>("Other");
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

  const onRejectRepurpose = useCallback(async () => {
    await chatDB.threads.update(threadId, {
      repurposeDocument: "",
      updatedAt: new Date(),
      synced: 0,
    });
  }, [threadId]);

  const onAcceptRepurpose = useCallback(
    async (thread: ThreadModel) => {
      onRejectRepurpose();
      const newThreadId = await chatDB.createThread({
        title: `${thread?.title}: ${documentTypes[repurposeDocumentType].name}`,
        document: thread?.repurposeDocument || "",
        model: "writer",
        modelParams: {
          documentType: repurposeDocumentType,
          topic: "",
        },
        app: "writer",
      });

      await chatDB.addMessage({
        threadId: newThreadId,
        content: "Repurpose document",
        role: "user",
        status: "done",
        model: "writer",
        modelParams: {
          documentType: repurposeDocumentType,
          topic: "",
        },
        synced: 0,
      });

      await chatDB.addMessage({
        threadId: newThreadId,
        content: thread?.repurposeDocument || "",
        role: "assistant",
        status: "done",
        model: "writer",
        modelParams: {
          documentType: repurposeDocumentType,
          topic: "",
        },
        synced: 0,
      });

      navigateToThread(newThreadId);
    },
    [repurposeDocumentType, navigateToThread, onRejectRepurpose],
  );

  async function onGenerateText(ask: WriterModel) {
    setIsStreaming(true);
    if (ask.repurpose && ask.modelParams.documentType) {
      setRepurposeDocumentType(ask.modelParams.documentType);
    }
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
  }, [thread?.document, setDocument, document]);

  return (
    <>
      <AppHeader thread={thread} />
      <div className="relative flex w-full flex-1 flex-col overflow-hidden">
        {threadId ? (
          <>
            {thread?.repurposeDocument ? (
              <div className="pt-12">
                <WriterEditor
                  isStreaming={isStreaming}
                  document={thread?.repurposeDocument || ""}
                  onChange={() => {}}
                  readOnly={true}
                />
                <div className="absolute top-0 w-full">
                  <div className="flex items-center justify-between p-2 border bg-muted">
                    <span>
                      Repurposing document to:&nbsp;
                      {documentTypes[repurposeDocumentType].name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        disabled={isStreaming}
                        onClick={onRejectRepurpose}
                      >
                        Reject
                      </Button>
                      <Button
                        disabled={isStreaming}
                        onClick={() => onAcceptRepurpose(thread)}
                      >
                        Save as new document
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {remainingLimits === 0 && (
                  <ChatLimitBanner
                    isLoggedIn={true}
                    message="You've reached the message limit."
                  />
                )}
                {remainingLimits !== undefined &&
                  remainingLimits <= 10 &&
                  remainingLimits > 0 && (
                    <ChatLimitBanner
                      isLoggedIn={true}
                      message={`You've ${remainingLimits} messages left.`}
                    />
                  )}
                <WriterEditor
                  isStreaming={isStreaming}
                  document={
                    ((document || "").length > 0
                      ? document
                      : thread?.documentProposedDiff) || ""
                  }
                  proposedDiff={
                    (document || "").length === 0
                      ? thread?.documentProposedDiff
                      : undefined
                  }
                  onChange={onEditorChange}
                  onRejectProposal={onRejectProposal}
                  onStatsChange={onEditorStatsChange}
                />
                <WriterUpdateDocumentForm
                  selectionRange={selectionRange}
                  isStreaming={isStreaming}
                  onGenerateText={onGenerateText}
                />
              </>
            )}
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
