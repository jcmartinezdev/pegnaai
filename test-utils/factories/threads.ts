import { threadsTable } from "@/db/schema";
import { LlmModel } from "@/lib/chat/types";
import { faker } from "@faker-js/faker";

let uniqueIdCounter = 1;

const createDefaultDbThreadData = (): typeof threadsTable.$inferSelect => {
  uniqueIdCounter++;

  return {
    userId: "test-user-id",
    localId: `local-${uniqueIdCounter}`,
    title: faker.lorem.sentence(),
    model: "chat" as LlmModel,
    modelParams: {},
    pinned: false,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  };
};

export const createSampleThread = (
  overrides: Partial<typeof threadsTable.$inferSelect> = {},
): typeof threadsTable.$inferSelect => {
  // Merge defaults with any overrides provided
  return {
    ...createDefaultDbThreadData(),
    ...overrides, // Overrides will overwrite defaults
  };
};

export const createSampleThreads = (
  count: number,
  overrideFn?: (index: number) => Partial<typeof threadsTable.$inferSelect>,
): (typeof threadsTable.$inferSelect)[] => {
  return Array.from({ length: count }, (_, i) =>
    createSampleThread(overrideFn ? overrideFn(i) : {}),
  );
};
