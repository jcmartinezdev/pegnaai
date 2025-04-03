import { createSampleThreads } from "@/test-utils/factories/threads";
import { createSampleMessages } from "@/test-utils/factories/messages";
import { syncData } from "./actions";
import {
  getThreadsForUser,
  createOrUpdateThread,
  getMessagesForUser,
  createOrUpdateMessage,
  getThreadsToSync,
  getMessagesToSync,
} from "@/db/queries";
import { auth0 } from "../auth0";

jest.mock("@/db");
jest.mock("@/lib/auth0");
jest.mock("@/db/queries");

describe("syncData", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(getThreadsToSync).mockResolvedValue([]);
    jest.mocked(getMessagesToSync).mockResolvedValue([]);
  });

  it("should return an error if the user is not authenticated", async () => {
    jest.mocked(auth0.getSession).mockResolvedValueOnce(null);

    const result = await syncData([], [], new Date());
    expect(result.success).toEqual(false);
    expect(result.error).toEqual("User not authenticated");
  });

  describe("Threads - Pull", () => {
    it("shoud get threads to sync", async () => {
      const totalThreadsCount = Math.floor(Math.random() * 10) + 5;

      const lastSyncDate = new Date(Date.now()); // Simulate last sync date
      const dbThreads = createSampleThreads(totalThreadsCount, () => ({
        updatedAt: new Date(Date.now() - 1000), // Simulate older server copy
      }));

      jest.mocked(getThreadsToSync).mockResolvedValueOnce(dbThreads);
      const result = await syncData([], [], lastSyncDate);
      expect(result.success).toEqual(true);
      expect(result.data?.threads.length).toEqual(totalThreadsCount);
    });

    it("shoud get messages to sync", async () => {
      const totalMessagesCount = Math.floor(Math.random() * 10) + 5;

      const lastSyncDate = new Date(Date.now()); // Simulate last sync date
      const dbMessages = createSampleMessages(totalMessagesCount, () => ({
        updatedAt: new Date(Date.now() - 1000), // Simulate older server copy
      }));

      jest.mocked(getMessagesToSync).mockResolvedValueOnce(dbMessages);
      const result = await syncData([], [], lastSyncDate);
      expect(result.success).toEqual(true);
      expect(result.data?.messages.length).toEqual(totalMessagesCount);
    });
  });

  describe("Threads - Push", () => {
    it("should return an error if the user is not authorized to sync threads", async () => {
      const threads = createSampleThreads(5, () => ({
        userId: "otherUserId",
      }));
      const result = await syncData(threads, [], new Date());
      expect(result.success).toEqual(false);
      expect(result.error).toEqual("User not authorized to sync these records");
      expect(createOrUpdateThread).toHaveBeenCalledTimes(0);
    });

    it("should not update any threads if there are no changes", async () => {
      const result = await syncData([], [], new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: 0,
          updatedMessages: 0,
        }),
      );
      expect(createOrUpdateThread).toHaveBeenCalledTimes(0);
    });

    it("should add a new thread if it doesn't exist", async () => {
      const newThreadsCount = Math.floor(Math.random() * 10) + 1;
      const threads = createSampleThreads(newThreadsCount);

      jest.mocked(getThreadsForUser).mockResolvedValueOnce([]);

      const result = await syncData(threads, [], new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: newThreadsCount,
          updatedMessages: 0,
        }),
      );
      expect(createOrUpdateThread).toHaveBeenCalledTimes(newThreadsCount);
      for (let i = 0; i < newThreadsCount; i++) {
        expect(createOrUpdateThread).toHaveBeenCalledWith(threads[i]);
      }
    });

    it("should update a thread if the local copy is newer than the server copy", async () => {
      const totalThreadsCount = Math.floor(Math.random() * 10) + 5;
      const existingThreadsCount = Math.floor(Math.random() * 5) + 1;

      const threads = createSampleThreads(totalThreadsCount);

      // Simulate some threads already in the database with older timestamps
      jest.mocked(getThreadsForUser).mockResolvedValueOnce(
        threads.slice(0, existingThreadsCount).map((thread) => ({
          ...thread,
          updatedAt: new Date(Date.now() - 1000), // Simulate older server copy
        })),
      );

      const result = await syncData(threads, [], new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: totalThreadsCount,
          updatedMessages: 0,
        }),
      );
      expect(createOrUpdateThread).toHaveBeenCalledTimes(totalThreadsCount);
      for (let i = 0; i < totalThreadsCount; i++) {
        expect(createOrUpdateThread).toHaveBeenCalledWith(threads[i]);
      }
    });

    it("should not update a thread if the local copy is older than the server copy", async () => {
      const totalThreadsCount = Math.floor(Math.random() * 10) + 5;
      const existingThreadsCount = Math.floor(Math.random() * 5) + 1;
      const updatedThreadsCount = totalThreadsCount - existingThreadsCount;

      const threads = createSampleThreads(totalThreadsCount, () => ({
        updatedAt: new Date(Date.now() - 1500), // Simulate older local copy
      }));

      // Simulate some threads already in the database with older timestamps
      jest.mocked(getThreadsForUser).mockResolvedValueOnce(
        threads.slice(0, existingThreadsCount).map((thread) => ({
          ...thread,
          updatedAt: new Date(Date.now() + 1000), // Simulate newer server copy
        })),
      );

      const result = await syncData(threads, [], new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: updatedThreadsCount,
          updatedMessages: 0,
        }),
      );
      expect(createOrUpdateThread).toHaveBeenCalledTimes(updatedThreadsCount);
      for (let i = existingThreadsCount; i < totalThreadsCount; i++) {
        expect(createOrUpdateThread).toHaveBeenCalledWith(threads[i]);
      }
    });
  });

  describe("Messages - Push", () => {
    it("should return an error if the user is not authorized to sync messages", async () => {
      const messages = createSampleMessages(5, () => ({
        userId: "otherUserId",
      }));
      const result = await syncData([], messages, new Date());
      expect(result.success).toEqual(false);
      expect(result.error).toEqual("User not authorized to sync these records");
      expect(createOrUpdateMessage).toHaveBeenCalledTimes(0);
    });

    it("should not update any messages if there are no changes", async () => {
      const result = await syncData([], [], new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: 0,
          updatedMessages: 0,
        }),
      );
      expect(createOrUpdateMessage).toHaveBeenCalledTimes(0);
    });

    it("should add a new message if it doesn't exist", async () => {
      const newMessagesCount = Math.floor(Math.random() * 10) + 1;
      const messages = createSampleMessages(newMessagesCount);
      jest.mocked(getMessagesForUser).mockResolvedValueOnce([]);

      const result = await syncData([], messages, new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: 0,
          updatedMessages: newMessagesCount,
        }),
      );
      expect(createOrUpdateMessage).toHaveBeenCalledTimes(newMessagesCount);
      for (let i = 0; i < newMessagesCount; i++) {
        expect(createOrUpdateMessage).toHaveBeenCalledWith(messages[i]);
      }
    });

    it("should update a message if the local copy is newer than the server copy", async () => {
      const totalMessagesCount = Math.floor(Math.random() * 10) + 5;
      const existingMessagesCount = Math.floor(Math.random() * 5) + 1;
      const messages = createSampleMessages(totalMessagesCount);

      // Simulate some messages already in the database with older timestamps
      jest.mocked(getMessagesForUser).mockResolvedValueOnce(
        messages.slice(0, existingMessagesCount).map((message) => ({
          ...message,
          updatedAt: new Date(Date.now() - 1000), // Simulate older server copy
        })),
      );

      const result = await syncData([], messages, new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: 0,
          updatedMessages: totalMessagesCount,
        }),
      );
      expect(createOrUpdateMessage).toHaveBeenCalledTimes(totalMessagesCount);
      for (let i = 0; i < totalMessagesCount; i++) {
        expect(createOrUpdateMessage).toHaveBeenCalledWith(messages[i]);
      }
    });

    it("should not update a message if the local copy is older than the server copy", async () => {
      const totalMessagesCount = Math.floor(Math.random() * 10) + 5;
      const existingMessagesCount = Math.floor(Math.random() * 5) + 1;
      const updatedMessagesCount = totalMessagesCount - existingMessagesCount;

      const messages = createSampleMessages(totalMessagesCount, () => ({
        updatedAt: new Date(Date.now() - 1500), // Simulate older local copy
      }));

      // Simulate some messages already in the database with newer timestamps
      jest.mocked(getMessagesForUser).mockResolvedValueOnce(
        messages.slice(0, existingMessagesCount).map((message) => ({
          ...message,
          updatedAt: new Date(Date.now() + 1000), // Simulate newer server copy
        })),
      );

      const result = await syncData([], messages, new Date());
      expect(result.success).toEqual(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          updatedThreads: 0,
          updatedMessages: updatedMessagesCount,
        }),
      );
      expect(createOrUpdateMessage).toHaveBeenCalledTimes(updatedMessagesCount);
      for (let i = existingMessagesCount; i < totalMessagesCount; i++) {
        expect(createOrUpdateMessage).toHaveBeenCalledWith(messages[i]);
      }
    });
  });
});
