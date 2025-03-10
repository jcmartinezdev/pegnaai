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
  content: string;
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
    return await this.threads
      .where("status")
      .notEqual("deleted")
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
      status: "pending",
    });
  }

  async createrOnboardingThreads() {
    console.log("Creating onboarding threads");
    return this.transaction("rw", [this.threads, this.messages], async () => {
      await this.threads.bulkAdd([
        {
          id: "welcome",
          title: "Welcome to Next Chat",
          model: "gpt-3",
          pinned: false,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          status: "active",
        },
      ]);

      await this.messages.bulkAdd([
        {
          id: "welcome-1",
          threadId: "welcome",
          content: "What is Next Chat?",
          model: "gpt-3",
          modelParams: {},
          role: "user",
          createdAt: new Date(),
          status: "done",
        },
        {
          id: "welcome-2",
          threadId: "welcome",
          content:
            "Next Chat is a chat app built with Next.js and Tailwind CSS.",
          model: "gpt-3",
          modelParams: {},
          role: "assistant",
          createdAt: new Date(),
          status: "done",
        },
      ]);
    });
  }
}

export const chatDB = new ChatDB();
chatDB.open().catch(console.error);
