import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google, GoogleGenerativeAIProviderMetadata } from "@ai-sdk/google";
import { createDataStreamResponse, streamText, Tool } from "ai";
import { z } from "zod";
import { getUser } from "@/db/queries";
import { auth0 } from "@/lib/auth0";
import {
  AskMessagesModel,
  AskModel,
  LlmModel,
  ModelParams,
  models,
  SearchMetadata,
} from "@/lib/ai/types";
import { isFreePlan } from "@/lib/billing/account";
import { buildSystemPrompt, generateThreadTitle } from "@/lib/ai/agent";
import createGenerateImageTool from "@/lib/ai/tools/generateImage";
import { validateRateLimits } from "@/lib/billing/rate-limits";

type ModelSelectorItem = {
  provider: "google" | "openai" | "anthropic";
  modelName: string;
};

const modelSettings: Record<LlmModel, Record<string, ModelSelectorItem>> = {
  chat: {
    default: {
      provider: "google",
      modelName: "gemini-2.0-flash",
    },
    search: {
      provider: "google",
      modelName: "gemini-2.0-flash",
    },
    reasoning: {
      provider: "openai",
      modelName: "o3-mini",
    },
    searchreasoning: {
      provider: "google",
      modelName: "gemini-2.0-flash",
    },
  },
  code: {
    _default: {
      provider: "anthropic",
      modelName: "claude-3-7-sonnet-20250219",
    },
  },
  writer: {
    _default: {
      provider: "openai",
      modelName: "gpt-4o",
    },
  },
};

const getModelSettings = (
  model: LlmModel,
  modelParams?: ModelParams,
): ModelSelectorItem => {
  const settings = modelSettings[model];

  const params =
    (modelParams?.includeSearch ? "search" : "") +
    (modelParams?.reasoningEffort ? "reasoning" : "");

  return settings[params] || settings.default || modelSettings["chat"].default;
};

function getModel(selectedModel: LlmModel, modelParams?: ModelParams) {
  const llmModelSettings = getModelSettings(selectedModel, modelParams);
  const llmModel = models[selectedModel];

  switch (llmModelSettings.provider) {
    case "openai":
      return {
        model: openai(llmModelSettings.modelName, {
          reasoningEffort: llmModel.allowReasoning
            ? modelParams?.reasoningEffort || "medium"
            : "low",
        }),
      };
    case "google":
      return {
        model: google(llmModelSettings.modelName, {
          useSearchGrounding: modelParams?.includeSearch || false,
        }),
      };
    case "anthropic":
      return {
        model: anthropic(llmModelSettings.modelName, {
          sendReasoning: true,
        }),
        providerOptions: {
          anthropic: {
            thinking:
              modelParams?.reasoningEffort === "high"
                ? {
                    type: "enabled",
                    budgetTokens: 2000,
                  }
                : { type: "disabled", budgetTokens: 0 },
          },
        },
      };
  }
}

const askModelSchema = z.object({
  threadId: z.string(),
  model: z.enum(Object.keys(models) as [LlmModel, ...LlmModel[]]),
  modelParams: z.object({
    reasoningEffort: z.enum(["low", "high"] as const).optional(),
    includeSearch: z.boolean().optional(),
  }) satisfies z.ZodType<ModelParams>,
  generateTitle: z.boolean().optional(),
  messages: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      role: z.enum(["assistant", "user", "system"]),
    }),
  ) satisfies z.ZodType<AskMessagesModel[]>,
}) satisfies z.ZodType<AskModel>;

export async function POST(req: Request) {
  const body = await req.json();
  const { success, data } = askModelSchema.safeParse(body);
  if (!success) {
    return new Response(
      JSON.stringify({ message: "Invalid request", type: "invalid_request" }),
      { status: 400 },
    );
  }
  const { model, modelParams, messages, generateTitle } = data;

  const session = await auth0.getSession();
  const user = await getUser(session?.user.sub || "unknown");

  const currentModel = models[model];

  let remainingMessages = 0;
  let remainingPremiumMessages = 0;
  try {
    const result = await validateRateLimits(currentModel, modelParams);
    remainingMessages = result.remainingMessages;
    remainingPremiumMessages = result.remainingPremiumMessages;
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error,
        type: "rate_limit",
      }),
      { status: 429 },
    );
  }

  const systemPrompt = await buildSystemPrompt(
    session?.user.sub,
    session?.user.name,
    user?.planName,
  );

  const pendingPromises: Promise<any>[] = [];

  return createDataStreamResponse({
    execute: (dataStream) => {
      if (generateTitle) {
        // Generate the chat title
        pendingPromises.push(
          generateThreadTitle(messages[0].content).then((title) => {
            dataStream.writeData({
              type: "thread-metadata",
              generatedTitle: title,
            });
          }),
        );
      }

      if (remainingPremiumMessages < 10 || remainingMessages < 10) {
        dataStream.writeData({
          type: "rate-limit",
          value: {
            remainingMessages,
            remainingPremiumMessages,
          },
        });
      }

      const tools: Record<string, Tool> = {};
      if (!isFreePlan(user?.planName)) {
        tools.generateImage = createGenerateImageTool(
          dataStream,
          session?.user.sub,
        );
      }

      const result = streamText({
        ...getModel(model, modelParams),
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        tools,
        onFinish: async ({ providerMetadata }) => {
          await Promise.all(pendingPromises);
          // Process provider metadata
          const googleMetadata = providerMetadata?.google as
            | GoogleGenerativeAIProviderMetadata
            | undefined;

          if (googleMetadata) {
            if (
              googleMetadata.groundingMetadata &&
              googleMetadata.groundingMetadata.groundingSupports
            ) {
              const searchMetadata: SearchMetadata[] =
                googleMetadata.groundingMetadata.groundingSupports.map((gs) => {
                  const gc =
                    googleMetadata.groundingMetadata?.groundingChunks?.[
                      gs.groundingChunkIndices?.[0] || 0
                    ];
                  return {
                    confidenceScore: gs.confidenceScores?.[0] || undefined,
                    source: (gc?.web || gc?.retrievedContext || undefined) && {
                      url: gc?.web?.uri || gc?.retrievedContext?.uri || "",
                      title:
                        gc?.web?.title || gc?.retrievedContext?.title || "",
                    },
                    snippet: gs.segment?.text || "",
                  };
                });
              dataStream.writeData({
                type: "search-metadata",
                value: searchMetadata,
              });
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      console.log("Error", error);
      return "There was an error with the request";
    },
  });
}
