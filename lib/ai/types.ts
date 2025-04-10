export type LlmModel = "chat" | "code" | "writer";
export type PegnaAppType = "chat" | "writer";

export const traits = [
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and approachable",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Formal and business-like",
  },
  {
    value: "creative",
    label: "Creative",
    description: "Imaginative and original",
  },
  {
    value: "concise",
    label: "Concise",
    description: "Brief and to the point",
  },
  {
    value: "humorous",
    label: "Humorous",
    description: "Witty and entertaining",
  },
  {
    value: "analytical",
    label: "Analytical",
    description: "Logical and detailed",
  },
];

type ModelType = {
  name: string;
  description: string;
  allowSearch: boolean;
  allowReasoning: boolean;

  /**
   * Whether the model requires a Pro plan to use
   */
  requiresPro: boolean;
  /**
   * Whether the model counts towards your premium quota
   */
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
  writer: {
    name: "Writer",
    description: "Optimized for writing and creative tasks.",
    allowSearch: false,
    allowReasoning: false,
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

export type ToolResponse = {
  toolCallId: string;
  toolName: string;
  generateImage: {
    prompt?: string;
    url?: string;
    result?: string;
  };
};

export type MessageKind = "text" | "image";

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
    }
  | {
      type: "message-kind";
      value: {
        kind: MessageKind;
      };
    }
  | {
      type: "tool-image-url";
      value: {
        prompt: string;
        url: string;
      };
    };

export interface FinishedStreamType {
  finishReason?: "stop" | "length" | "content-filter" | "error" | "tool-calls";
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
