import { LlmModel } from "@/lib/ai/types";
import { MessageModel } from "@/lib/localDb";
import { faker } from "@faker-js/faker";

let uniqueIdCounter = 1;

const createDefaultLocalMessage = (): MessageModel => {
  uniqueIdCounter++;

  return {
    id: `message-${uniqueIdCounter}`,
    threadId: `thread-${uniqueIdCounter}`,
    model: "chat" as LlmModel,
    modelParams: {},
    content: faker.lorem.paragraphs({ min: 4, max: 10 }),
    reasoning: faker.lorem.paragraphs({ min: 1, max: 3 }),
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "done",
    synced: 0,
  };
};

export const createSampleLocalMessage = (
  overrides: Partial<MessageModel> = {},
): MessageModel => {
  // Merge defaults with any overrides provided
  return {
    ...createDefaultLocalMessage(),
    ...overrides, // Overrides will overwrite defaults
  };
};

export const createSampleLocalMessages = (
  count: number,
  overrideFn?: (index: number) => Partial<MessageModel>,
) => {
  return Array.from({ length: count }, (_, i) =>
    createSampleLocalMessage(overrideFn ? overrideFn(i) : {}),
  );
};
