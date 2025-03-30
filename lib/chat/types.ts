export type LlmModel = "chat" | "code";

type ModelType = {
  name: string;
  description: string;
  allowSearch: boolean;
  allowReasoning: boolean;

  requiresPro: boolean;
  isPremium: boolean;
};

export const models: Record<LlmModel, ModelType> = {
  chat: {
    name: "Chat",
    description: "Optimized for chat, general questions, and every day tasks.",
    allowSearch: true,
    allowReasoning: true,
    requiresPro: false,
    isPremium: false,
  },
  code: {
    name: "Code",
    description: "Code completion and generation.",
    allowSearch: false,
    allowReasoning: true,
    requiresPro: true,
    isPremium: true,
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

export type CustomMetadataType =
  | {
      type: "thread-metadata";
      generatedTitle: string;
    }
  | {
      type: "search-metadata";
      value: SearchMetadata[];
    }
  | {
      type: "rate-limit";
      value: {
        remainingMessages: number;
        remainingPremiumMessages: number;
      };
    };

export interface FinishedStreamType {
  finishReason?: "stop" | "length" | "content-filter" | "error";
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  isContinued?: boolean;
}

export interface AskMessagesModel {
  id: string;
  content: string;
  role: "assistant" | "user" | "system";
}

export interface AskModel {
  threadId: string;
  generateTitle?: boolean;
  model: LlmModel;
  modelParams: ModelParams;
  messages: AskMessagesModel[];
}
