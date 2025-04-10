"use client";

console.log("[DB] Initializing chat database...");

import Dexie, { type EntityTable } from "dexie";
import {
  LlmModel,
  MessageKind,
  ModelParams,
  SearchMetadata,
  ToolResponse,
} from "./chat/types";

export interface ThreadModel {
  id: string;
  title: string;
  model: LlmModel;
  modelParams: ModelParams;
  pinned: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "deleted";
  synced: number;
}

export type MessageStatus =
  | "done"
  | "deleted"
  | "streaming"
  | "streaming-image"
  | "cancelled"
  | "error";

export interface MessageModel {
  id: string;
  threadId: string;
  model: LlmModel;
  modelParams: ModelParams;
  content: string;
  kind?: MessageKind;
  toolResponses?: ToolResponse[];
  reasoning?: string;
  searchMetadata?: SearchMetadata[];
  serverError?: {
    message: string;
    type: string;
  };
  role: "assistant" | "user" | "system";
  createdAt: Date;
  updatedAt: Date;
  status: MessageStatus;
  synced: number;
}

export class ChatDB extends Dexie {
  threads!: EntityTable<ThreadModel, "id">;
  messages!: EntityTable<MessageModel, "id">;

  constructor() {
    super("chatdb");
    this.version(1).stores({
      threads: "id, createdAt, status, synced",
      messages: "id, threadId, createdAt, status, synced",
      limits: "id",
    });

    this.threads = this.table("threads");
    this.messages = this.table("messages");
  }

  async getAllThreads() {
    return await this.threads
      .where("status")
      .notEqual("deleted")
      .reverse()
      .sortBy("lastMessageAt");
  }

  async getThread(threadId: string) {
    return await this.threads.get(threadId);
  }

  async getAllMessages() {
    return await this.messages
      .where("status")
      .notEqual("deleted")
      .reverse()
      .sortBy("createdAt");
  }

  async getAllMessagesForThread(threadId: string) {
    return await this.messages
      .where("threadId")
      .equals(threadId)
      .and((message) => message.status !== "deleted")
      .sortBy("createdAt");
  }

  async createThread(
    thread: Omit<
      ThreadModel,
      | "id"
      | "lastMessageAt"
      | "updatedAt"
      | "pinned"
      | "status"
      | "createdAt"
      | "synced"
    >,
  ) {
    return this.threads.add({
      ...thread,
      id: crypto.randomUUID(),
      pinned: false,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      synced: 0,
    });
  }

  async addMessage(
    message: Omit<MessageModel, "id" | "createdAt" | "updatedAt">,
  ) {
    return this.transaction("rw", [this.threads, this.messages], async () => {
      const date = new Date();
      const newMessage = await this.messages.add({
        ...message,
        id: crypto.randomUUID(),
        createdAt: date,
        updatedAt: date,
        synced: 0,
      });

      await chatDB.threads.update(message.threadId, {
        model: message.model,
        modelParams: message.modelParams,
        lastMessageAt: date,
        updatedAt: date,
        synced: 0,
      });

      return newMessage;
    });
  }

  async markMessageDone(
    messageId: string,
    threadId: string,
    appendContent?: string,
  ) {
    return this.transaction("rw", [this.threads, this.messages], async () => {
      const date = new Date();
      if (appendContent) {
        await this.messages.update(messageId, {
          status: "done",
          content:
            ((await this.messages.get(messageId))?.content || "") +
            appendContent,
          synced: 0,
          updatedAt: date,
        });
      } else {
        await this.messages.update(messageId, {
          status: "done",
          synced: 0,
          updatedAt: date,
        });
      }

      await chatDB.threads.update(threadId, {
        updatedAt: date,
        lastMessageAt: date,
        synced: 0,
      });
    });
  }

  async getThreadsToSync() {
    return await this.threads.where("synced").equals(0).sortBy("updatedAt");
  }

  async getMessagesToSync() {
    return await this.messages.where("synced").equals(0).sortBy("updatedAt");
  }

  async updateThreads(threads: ThreadModel[]) {
    return this.transaction("rw", [this.threads], async () => {
      for (const thread of threads) {
        if ((await this.threads.get(thread.id)) === undefined) {
          await this.threads.add({
            ...thread,
          });
        } else {
          await this.threads.update(thread.id, {
            ...thread,
          });
        }
      }
    });
  }

  async updateMessages(messages: MessageModel[]) {
    return this.transaction("rw", [this.messages], async () => {
      for (const message of messages) {
        if ((await this.messages.get(message.id)) === undefined) {
          await this.messages.add({
            ...message,
          });
        } else {
          await this.messages.update(message.id, {
            ...message,
          });
        }
      }
    });
  }

  async clearAllData() {
    return this.transaction("rw", [this.threads, this.messages], async () => {
      await this.threads.clear();
      await this.messages.clear();
    });
  }
}

export const chatDB = new ChatDB();
if (typeof window !== "undefined") {
  chatDB.open().catch(console.error);
}
