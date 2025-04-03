"use server";

import {
  createOrUpdateMessage,
  createOrUpdateThread,
  getMessagesForUser,
  getMessagesToSync,
  getThreadsForUser,
  getThreadsToSync,
  getUser,
} from "@/db/queries";
import { messagesTable, threadsTable } from "@/db/schema";
import { auth0 } from "../auth0";
import { ActionResponse } from "../types";

type SyncDataResponse = {
  updatedThreads: number;
  updatedMessages: number;
  threads: (typeof threadsTable.$inferSelect)[];
  messages: (typeof messagesTable.$inferSelect)[];
};

/**
 * Check if the user wants to sync data
 *
 * @returns true if the user wants to sync data, false otherwise
 */
export async function shouldSyncData() {
  const session = await auth0.getSession();
  if (!session) {
    return false;
  }

  const userId = session.user.sub;

  // If the user never specified his prefernce, it syncs by default
  const user = await getUser(userId);
  if (!user) {
    return true;
  }

  return user.enableSync;
}

/**
 * Sync data with the server
 */
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

  // Verify that the user coming from the FE matches the user doing the sync
  const threadsUserMismatch = threads.some(
    (thread) => thread.userId !== userId,
  );
  const messagesUserMismatch = messages.some(
    (message) => message.userId !== userId,
  );
  if (threadsUserMismatch || messagesUserMismatch) {
    return {
      success: false,
      error: "User not authorized to sync these records",
    };
  }

  let updatedThreads = 0;
  let updatedMessages = 0;

  const operations = [];
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
      // We need to filter the threads and messages to not include those I just received
      threads: localState[0].filter(
        (nt) => !threads.some((t) => t.localId === nt.localId),
      ),
      messages: localState[1].filter(
        (nm) => !messages.some((m) => m.localId === nm.localId),
      ),
    },
  };
}
