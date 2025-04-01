"use server";

import {
  createOrUpdateMessage,
  createOrUpdateThread,
  getMessagesForUser,
  getMessagesToSync,
  getThreadsForUser,
  getThreadsToSync,
} from "@/db/queries";
import { messagesTable, threadsTable } from "@/db/schema";
import { ActionResponse } from "../billing/types";
import { auth0 } from "../auth0";

type SyncDataResponse = {
  updatedThreads: number;
  updatedMessages: number;
  threads: (typeof threadsTable.$inferSelect)[];
  messages: (typeof messagesTable.$inferSelect)[];
};

export async function syncData(
  threads: (typeof threadsTable.$inferSelect)[],
  messages: (typeof messagesTable.$inferSelect)[],
  lastSyncDate: Date,
): Promise<ActionResponse<SyncDataResponse>> {
  const session = await auth0.getSession();
  if (!session) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }

  const userId = session.user.sub;

  let updatedThreads = 0;
  let updatedMessages = 0;

  const operations: Promise<any>[] = [];
  //
  // Now let's sync the threads
  //
  if (threads.length > 0) {
    const currentThreads = await getThreadsForUser(
      userId,
      threads.map((t) => t.localId),
    );
    for (const thread of threads) {
      const existingThread = currentThreads.find(
        (t) => t.localId === thread.localId,
      );

      if (existingThread) {
        // If server version is newer, skip the update
        if (existingThread.updatedAt > thread.updatedAt) {
          continue;
        }
      }

      updatedThreads++;
      operations.push(createOrUpdateThread(thread));
    }
  }

  //
  // Now let's sync the messages
  //
  if (messages.length > 0) {
    const currentMessages = await getMessagesForUser(
      userId,
      messages.map((m) => m.localId),
    );
    for (const message of messages) {
      const existingMessage = currentMessages.find(
        (t) => t.localId === message.localId,
      );

      if (existingMessage) {
        // If server version is newer, skip the update
        if (existingMessage.updatedAt > message.updatedAt) {
          continue;
        }
      }

      updatedMessages++;
      operations.push(createOrUpdateMessage(message));
    }
  }

  await Promise.all(operations);

  // Next, we need to fetch the new records to update the local state
  const localState = await Promise.all([
    getThreadsToSync(userId, lastSyncDate),
    getMessagesToSync(userId, lastSyncDate),
  ]);

  return {
    success: true,
    data: {
      updatedThreads,
      updatedMessages,
      threads: localState[0],
      messages: localState[1],
    },
  };
}
