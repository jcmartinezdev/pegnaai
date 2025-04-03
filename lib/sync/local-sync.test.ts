import { createSampleLocalThreads } from "@/test-utils/factories/local-threads";
import { chatDB } from "../localDb";
import { localSyncData } from "./local-sync";
import { shouldSyncData, syncData } from "./actions";
import { createSampleThreads } from "@/test-utils/factories/threads";
import { createSampleMessages } from "@/test-utils/factories/messages";

jest.mock("@/lib/auth0");
jest.mock("@/db");
jest.mock("@/lib/sync/actions");
jest.mock("@/lib/localDb");

describe("Local Sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.mocked(shouldSyncData).mockResolvedValue(true);
    jest.mocked(syncData).mockReturnValue(
      new Promise((resolve) =>
        resolve({
          success: true,
          data: {
            updatedMessages: 0,
            updatedThreads: 0,
            threads: [],
            messages: [],
          },
        }),
      ),
    );
  });

  it("should not call sync data if userId is not provided", async () => {
    await localSyncData();
    expect(syncData).not.toHaveBeenCalled();
  });

  it("should not sync data if the user doesn't want to", async () => {
    jest.mocked(shouldSyncData).mockResolvedValue(false);
    await localSyncData("test-user-id");
    expect(syncData).not.toHaveBeenCalled();
  });

  it("should call sync data with the data needed to sync", async () => {
    chatDB.getThreadsToSync = jest
      .fn()
      .mockResolvedValue(createSampleLocalThreads(3));

    chatDB.getMessagesToSync = jest
      .fn()
      .mockResolvedValue(createSampleLocalThreads(4));

    await localSyncData("test-user-id");

    expect(syncData).toHaveBeenCalled();
    expect(syncData).toHaveBeenCalledWith(
      expect.objectContaining({ length: 3 }),
      expect.objectContaining({ length: 4 }),
      expect.any(Date),
    );
  });

  it("should throw an error if sync data fails", async () => {
    jest.mocked(syncData).mockResolvedValueOnce({
      success: false,
      error: "Sync failed",
    });

    await expect(localSyncData("test-user-id")).rejects.toThrow("Sync failed");
  });

  it("should add the userId to the threads and messages", async () => {
    const threads = createSampleLocalThreads(3);
    const messages = createSampleLocalThreads(4);

    chatDB.getThreadsToSync = jest.fn().mockResolvedValue(threads);
    chatDB.getMessagesToSync = jest.fn().mockResolvedValue(messages);

    await localSyncData("test-user-id");

    expect(syncData).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          userId: "test-user-id",
          localId: expect.stringMatching(/(.|\s)*\S(.|\s)*/),
        }),
      ]),
      expect.arrayContaining([
        expect.objectContaining({
          userId: "test-user-id",
          localId: expect.stringMatching(/(.|\s)*\S(.|\s)*/),
        }),
      ]),
      expect.any(Date),
    );
  });

  it("should update the last sync date in local storage", async () => {
    expect(localStorage.getItem("lastSyncDate")).toBeFalsy();
    const threads = createSampleLocalThreads(3);
    const messages = createSampleLocalThreads(4);

    chatDB.getThreadsToSync = jest.fn().mockResolvedValue(threads);
    chatDB.getMessagesToSync = jest.fn().mockResolvedValue(messages);

    await localSyncData("test-user-id");

    expect(localStorage.getItem("lastSyncDate")).toBeTruthy();
  });

  it("should update the local threads with the server response", async () => {
    const threads = createSampleLocalThreads(0);
    const messages = createSampleLocalThreads(0);
    const totalThreadsToSyncToLocal = Math.floor(Math.random() * 10) + 1;

    jest.mocked(syncData).mockReturnValue(
      new Promise((resolve) =>
        resolve({
          success: true,
          data: {
            updatedMessages: 0,
            updatedThreads: 0,
            threads: createSampleThreads(totalThreadsToSyncToLocal),
            messages: [],
          },
        }),
      ),
    );

    chatDB.getThreadsToSync = jest.fn().mockResolvedValue(threads);
    chatDB.getMessagesToSync = jest.fn().mockResolvedValue(messages);

    await localSyncData("test-user-id");

    expect(chatDB.updateThreads).toHaveBeenCalledTimes(2);
    expect(chatDB.updateThreads).toHaveBeenCalledWith(
      expect.objectContaining({ length: totalThreadsToSyncToLocal }),
    );
    expect(chatDB.updateThreads).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/(.|\s)*\S(.|\s)*/),
          model: "chat",
          synced: 1,
        }),
      ]),
    );
  });

  it("should update the local messages with the server response", async () => {
    const threads = createSampleLocalThreads(0);
    const messages = createSampleLocalThreads(0);
    const totalMessagesToSyncToLocal = Math.floor(Math.random() * 10) + 1;

    jest.mocked(syncData).mockReturnValue(
      new Promise((resolve) =>
        resolve({
          success: true,
          data: {
            updatedMessages: 0,
            updatedThreads: 0,
            threads: [],
            messages: createSampleMessages(totalMessagesToSyncToLocal),
          },
        }),
      ),
    );

    chatDB.getThreadsToSync = jest.fn().mockResolvedValue(threads);
    chatDB.getMessagesToSync = jest.fn().mockResolvedValue(messages);

    await localSyncData("test-user-id");

    expect(chatDB.updateMessages).toHaveBeenCalledTimes(2);
    expect(chatDB.updateMessages).toHaveBeenCalledWith(
      expect.objectContaining({ length: totalMessagesToSyncToLocal }),
    );
    expect(chatDB.updateMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/(.|\s)*\S(.|\s)*/),
          model: "chat",
          synced: 1,
        }),
      ]),
    );
  });
});
