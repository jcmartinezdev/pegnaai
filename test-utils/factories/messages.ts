import { messagesTable } from "@/db/schema";
import { LlmModel } from "@/lib/chat/types";
import { faker } from "@faker-js/faker";

let uniqueIdCounter = 1;

const createDefaultDbMessageData = (): typeof messagesTable.$inferSelect => {
  uniqueIdCounter++;

  return {
    userId: "test-user-id",
    localId: `local-${uniqueIdCounter}`,
    threadId: `thread-${uniqueIdCounter}`,
    model: "chat" as LlmModel,
    modelParams: {},
    content: faker.lorem.paragraphs({ min: 4, max: 10 }),
    kind: "text",
    toolResponses: null,
    reasoning: faker.lorem.paragraphs({ min: 1, max: 3 }),
    searchMetadata: null,
    serverError: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  };
};

export const createSampleMessage = (
  overrides: Partial<typeof messagesTable.$inferSelect> = {},
): typeof messagesTable.$inferSelect => {
  // Merge defaults with any overrides provided
  return {
    ...createDefaultDbMessageData(),
    ...overrides, // Overrides will overwrite defaults
  };
};

export const createSampleMessages = (
  count: number,
  overrideFn?: (index: number) => Partial<typeof messagesTable.$inferSelect>,
): (typeof messagesTable.$inferSelect)[] => {
  return Array.from({ length: count }, (_, i) =>
    createSampleMessage(overrideFn ? overrideFn(i) : {}),
  );
};
