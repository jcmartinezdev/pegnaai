import { chatDB } from "../localDb";
import {
  LlmModel,
  ModelParams,
  SearchMetadata,
  ToolResponse,
} from "../chat/types";
import { syncData } from "./actions";

export const LAST_SYNC_DATE_STORAGE_KEY = "lastSyncDate";

export async function localSyncData(userId?: string) {
  if (!userId) {
    return;
  }
  const threads = await chatDB.getThreadsToSync();
  const messages = await chatDB.getMessagesToSync();

  const toServerThreads = (await threads.toArray()).map((thread) => ({
    ...thread,
    localId: thread.id,
    userId,
  }));

  const toServerMessages = (await messages.toArray()).map((message) => ({
    ...message,
    localId: message.id,
    userId,
    toolResponses: message.toolResponses || null,
    searchMetadata: message.searchMetadata || null,
    serverError: message.serverError || null,
    reasoning: message.reasoning || null,
  }));

  const lastSyncDate = new Date(
    localStorage.getItem(LAST_SYNC_DATE_STORAGE_KEY) ||
      new Date().toISOString(),
  );

  // Sync data with the server
  console.log("[SYNC] Syncing data with the server...", {
    messages: messages.count(),
    threads: threads.count(),
  });

  const response = await syncData(
    toServerThreads,
    toServerMessages,
    lastSyncDate,
  );

  if (!response.success) {
    console.error("[SYNC] Error syncing data with the server", response.error);
    throw new Error(response.error);
  }

  // Update the local database with the server response
  if (!response.data) {
    console.error("[SYNC] No data received from the server");
    throw new Error("No data received from the server");
  }

  const { threads: serverThreads, messages: serverMessages } = response.data;
  await chatDB.updateThreads(
    serverThreads.map((thread) => ({
      ...thread,
      id: thread.localId,
      model: thread.model as LlmModel,
      modelParams: thread.modelParams as ModelParams,
      status: thread.status as "active" | "deleted",
      synced: true,
    })),
  );
  await chatDB.updateMessages(
    serverMessages.map((message) => ({
      ...message,
      id: message.localId,
      model: message.model as LlmModel,
      modelParams: message.modelParams as ModelParams,
      toolResponses: (message.toolResponses as ToolResponse[]) || undefined,
      searchMetadata: (message.searchMetadata as SearchMetadata[]) || undefined,
      serverError:
        (message.serverError as { message: string; type: string }) || undefined,
      reasoning: message.reasoning || undefined,
      status: message.status as "done" | "deleted" | "streaming" | "cancelled",
      role: message.role as "assistant" | "user" | "system",
      synced: true,
    })),
  );

  // Update the last sync date
  localStorage.setItem(LAST_SYNC_DATE_STORAGE_KEY, new Date().toISOString());

  console.log("[SYNC] Data synced successfully", response);

  return response.data;
}
