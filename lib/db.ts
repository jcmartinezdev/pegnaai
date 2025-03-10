import Dexie, { type EntityTable } from "dexie";

type LlmModel = string;

type ModelParams = {
  reasoningEffort?: string;
  includeSearch?: boolean;
};

interface ThreadModel {
  id: string;
  title: string;
  model: LlmModel;
  pinned: boolean;
  lastMessageAt: Date;
  updatedAt: Date;
  status: "active" | "deleted" | "pending";
}

interface MessageModel {
  id: string;
  threadId: string;
  model: LlmModel;
  modelParams: ModelParams;
  reasoning?: string;
  role: "assistant" | "user" | "system";
  createdAt: Date;
  status: "done" | "deleted" | "streaming" | "cancelled";
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
    console.log("lallaa", await this.threads.toArray());
    return await this.threads
      .where("status")
      .notEqual("deleted")
      .sortBy("lastMessageAt");
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
      status: "pending",
    });
  }

  async createrOnboardingThreads() {
    console.log("Creating onboarding threads");
    return this.createThread({
      title: "Welcome to Next Chat",
      model: "gpt-3",
    });
  }
}

export const chatDB = new ChatDB();
chatDB.open().catch(console.error);
