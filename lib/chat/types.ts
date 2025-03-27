export type LlmModel = "fast" | "balanced" | "powerful" | "code";

type ModelType = {
  name: string;
  provider: "openai" | "google" | "anthropic";
  description: string;
  actualModel: string;
  allowSearch: boolean;
  allowReasoning: boolean;

  isPremium: boolean;
};

export const models: Record<LlmModel, ModelType> = {
  fast: {
    name: "Super Fast",
    description: "Optimized for speed and good accuracy.",
    provider: "google",
    actualModel: "gemini-2.0-flash",
    allowSearch: true,
    allowReasoning: false,
    isPremium: false,
  },
  balanced: {
    name: "Balanced",
    description: "Good balance between speed and capabilities.",
    provider: "openai",
    actualModel: "o3-mini",
    allowSearch: false,
    allowReasoning: true,
    isPremium: false,
  },
  powerful: {
    name: "Powerful",
    description: "Cutting-edge capabilities, top of the line model.",
    provider: "openai",
    actualModel: "GPT 4o",
    allowSearch: false,
    allowReasoning: false,
    isPremium: true,
  },
  code: {
    name: "Code",
    description: "Code completion and generation.",
    provider: "anthropic",
    actualModel: "claude-3-7-sonnet-20250219",
    allowSearch: false,
    allowReasoning: true,
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
