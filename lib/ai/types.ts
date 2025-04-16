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

export type ModelType = {
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
  /**
   * Whether the model is available for chat
   */
  allowInChat: boolean;
};

export const models: Record<LlmModel, ModelType> = {
  chat: {
    name: "Chat",
    description: "Optimized for chat, general questions, and every day tasks.",
    allowSearch: true,
    allowReasoning: true,
    requiresPro: false,
    isPremium: false,
    allowInChat: true,
  },
  code: {
    name: "Code",
    description: "Code completion and generation.",
    allowSearch: false,
    allowReasoning: true,
    requiresPro: true,
    isPremium: true,
    allowInChat: true,
  },
  writer: {
    name: "Writer",
    description: "Optimized for writing and creative tasks.",
    allowSearch: false,
    allowReasoning: false,
    requiresPro: false,
    isPremium: false,
    allowInChat: false,
  },
};

export type PegnaDocument = "Blog" | "YT" | "Letter" | "Resume" | "Other";

type PegnaDocumentType = {
  name: string;
  description: string;
  generationPrompt: string;
  repurposePrompt: string;
};

export const documentTypes: Record<PegnaDocument, PegnaDocumentType> = {
  Blog: {
    name: "Blog Post",
    description: "A blog post or article.",
    generationPrompt: "Ensure the text style is suitable for a blog post.",
    repurposePrompt: "Repurpos the text into a blog post or article format.",
  },
  YT: {
    name: "YouTube Video",
    description: "A YouTube video script.",
    generationPrompt:
      "Ensure the text style is suitable for a YouTube video script.",
    repurposePrompt: "Repurpose the text into a YouTube video script.",
  },
  Letter: {
    name: "Letter",
    description: "A letter or email.",
    generationPrompt:
      "Ensure the text style is suitable for a letter or email.",
    repurposePrompt: "Repurpose the text into a letter or email format.",
  },
  Resume: {
    name: "Resume",
    description: "A resume or CV.",
    generationPrompt: "Ensure the text style is suitable for a resume or CV.",
    repurposePrompt: "Repurpose the text into a resume or CV format.",
  },
  Other: {
    name: "Other",
    description: "Any other type of document.",
    generationPrompt:
      "Ensure the text style is suitable for a general document.",
    repurposePrompt: "Repurpose the text into a general style format.",
  },
};

export type ModelParams = {
  reasoningEffort?: "low" | "high";
  includeSearch?: boolean;
  documentType?: PegnaDocument;
  topic?: string;
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
  generateImage?: {
    prompt?: string;
    url?: string;
    result?: string;
  };
  updateDocument?: {
    prompt?: string;
    change?: string;
  };
};

export type MessageKind = "text" | "image" | "document";

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
    }
  | {
      type: "document-clear";
    }
  | {
      type: "document-delta";
      delta: string;
    }
  | {
      type: "document-rep-delta";
      delta: string;
    }
  | {
      type: "document-diff-delta";
      delta: string;
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

export interface WriterModel {
  threadId: string;
  generateTitle?: boolean;
  prompt: string;
  document: string;
  modelParams: ModelParams;
  selectionRange?: {
    from: number;
    to: number;
  } | null;
  repurpose?: boolean;
}
