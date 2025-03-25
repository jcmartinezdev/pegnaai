"use client";

import Dexie, { type EntityTable } from "dexie";

export type LlmModel = "fast" | "balanced" | "powerful" | "code";

type ModelType = {
  name: string;
  provider: "openai" | "google" | "anthropic";
  description: string;
  actualModel: string;
  allowSearch: boolean;
  allowReasoning: boolean;
};

export const models: Record<LlmModel, ModelType> = {
  fast: {
    name: "Super Fast",
    description: "Optimized for speed and good accuracy.",
    provider: "google",
    actualModel: "gemini-2.0-flash",
    allowSearch: true,
    allowReasoning: false,
  },
  balanced: {
    name: "Balanced",
    description: "Good balance between speed and capabilities.",
    provider: "openai",
    actualModel: "o3-mini",
    allowSearch: false,
    allowReasoning: true,
  },
  powerful: {
    name: "Powerful",
    description: "Cutting-edge capabilities, top of the line model.",
    provider: "openai",
    actualModel: "GPT 4o",
    allowSearch: false,
    allowReasoning: false,
  },
  code: {
    name: "Code",
    description: "Code completion and generation.",
    provider: "anthropic",
    actualModel: "claude-3-7-sonnet-20250219",
    allowSearch: false,
    allowReasoning: true,
  },
};

export type ModelParams = {
  reasoningEffort?: "low" | "high";
  includeSearch?: boolean;
};

export type SearchMetadata = {
  confidenceScore?: number;
  source?: {
    url: string;
    title: string;
  };
  snippet: string;
};

export interface ThreadModel {
  id: string;
  title: string;
  model: LlmModel;
  modelParams: ModelParams;
  pinned: boolean;
  lastMessageAt: Date;
  updatedAt: Date;
  status: "active" | "deleted";
}

export interface MessageModel {
  id: string;
  threadId: string;
  model: LlmModel;
  modelParams: ModelParams;
  content: string;
  reasoning?: string;
  searchMetadata?: SearchMetadata[];
  serverError?: {
    message: string;
    type: string;
  };
  role: "assistant" | "user" | "system";
  createdAt: Date;
  status: "done" | "deleted" | "streaming" | "cancelled" | "error";
}

export class ChatDB extends Dexie {
  threads!: EntityTable<ThreadModel, "id">;
  messages!: EntityTable<MessageModel, "id">;

  constructor() {
    super("chatdb");
    this.version(1).stores({
      threads: "id, createdAt, status",
      messages: "id, threadId, createdAt, status",
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

  async getAllMessages(threadId: string) {
    return await this.messages
      .where("threadId")
      .equals(threadId)
      .and((message) => message.status !== "deleted")
      .sortBy("createdAt");
  }

  async createThread(
    thread: Omit<
      ThreadModel,
      "id" | "lastMessageAt" | "updatedAt" | "pinned" | "status"
    >,
  ) {
    return this.threads.add({
      ...thread,
      id: crypto.randomUUID(),
      pinned: false,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    });
  }

  async addMessage(message: Omit<MessageModel, "id" | "createdAt">) {
    return this.transaction("rw", [this.threads, this.messages], async () => {
      const date = new Date();
      const newMessage = await this.messages.add({
        ...message,
        id: crypto.randomUUID(),
        createdAt: date,
      });

      await chatDB.threads.update(message.threadId, {
        model: message.model,
        modelParams: message.modelParams,
        lastMessageAt: date,
        updatedAt: date,
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
        });
      } else {
        await this.messages.update(messageId, {
          status: "done",
        });
      }

      await chatDB.threads.update(threadId, {
        updatedAt: date,
        lastMessageAt: date,
        status: "active",
      });
    });
  }
}

export const chatDB = new ChatDB();
chatDB.open().catch(console.error);
