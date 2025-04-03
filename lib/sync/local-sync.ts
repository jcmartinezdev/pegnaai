"use client";

import { chatDB } from "../localDb";
import {
  LlmModel,
  ModelParams,
  SearchMetadata,
  ToolResponse,
} from "../chat/types";
import { shouldSyncData, syncData } from "./actions";

export const LAST_SYNC_DATE_STORAGE_KEY = "lastSyncDate";

export async function localSyncData(
  userId?: string,
  forceToSyncAllData?: boolean,
) {
  if (!userId) {
    return;
  }

  // Check if the user wants to sync data
  const shouldSync = await shouldSyncData();
  if (!shouldSync) {
    return;
  }

  console.log("[SYNC] Sync started ...");
  const threads = await (forceToSyncAllData
    ? chatDB.getAllThreads()
    : chatDB.getThreadsToSync());
  const messages = await (forceToSyncAllData
    ? chatDB.getAllMessages()
    : chatDB.getMessagesToSync());

  const toServerThreads = threads.map((thread) => ({
    ...thread,
    localId: thread.id,
    userId,
  }));

  const toServerMessages = messages.map((message) => ({
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
      new Date("2000-01-01").toISOString(),
  );

  // Sync data with the server
  console.log("[SYNC] Syncing data with the server, sending...", {
    messages: messages.length,
    threads: threads.length,
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

  console.log("[SYNC] Data received from the server", {
    threads: response.data.threads.length,
    messages: response.data.messages.length,
  });

  // Update the local database with items as synced
  await chatDB.updateThreads(
    threads.map((thread) => ({
      ...thread,
      synced: 1,
    })),
  );

  await chatDB.updateMessages(
    messages.map((message) => ({
      ...message,
      synced: 1,
    })),
  );

  const { threads: serverThreads, messages: serverMessages } = response.data;
  await chatDB.updateThreads(
    serverThreads.map((thread) => ({
      ...thread,
      id: thread.localId,
      model: thread.model as LlmModel,
      modelParams: thread.modelParams as ModelParams,
      status: thread.status as "active" | "deleted",
      synced: 1,
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
      synced: 1,
    })),
  );

  // Update the last sync date
  localStorage.setItem(LAST_SYNC_DATE_STORAGE_KEY, new Date().toISOString());

  console.log("[SYNC] Data synced successfully!");

  return response.data;
}
