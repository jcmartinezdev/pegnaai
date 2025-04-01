import { LlmModel } from "@/lib/chat/types";
import { ThreadModel } from "@/lib/localDb";
import { faker } from "@faker-js/faker";

let uniqueIdCounter = 1;

const createDefaultLocalThread = (): ThreadModel => {
  uniqueIdCounter++;

  return {
    id: `thread-${uniqueIdCounter}`,
    title: faker.lorem.sentence(),
    model: "chat" as LlmModel,
    modelParams: {},
    pinned: false,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    synced: false,
  };
};

export const createSampleLocalThread = (
  overrides: Partial<ThreadModel> = {},
): ThreadModel => {
  // Merge defaults with any overrides provided
  return {
    ...createDefaultLocalThread(),
    ...overrides, // Overrides will overwrite defaults
  };
};

export const createSampleLocalThreads = (
  count: number,
  overrideFn?: (index: number) => Partial<ThreadModel>,
) => {
  return {
    toArray: () =>
      new Promise<ThreadModel[]>((resolve) => {
        return resolve(
          Array.from({ length: count }, (_, i) =>
            createSampleLocalThread(overrideFn ? overrideFn(i) : {}),
          ),
        );
      }),
    count: () => count,
  };
};
