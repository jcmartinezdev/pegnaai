import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google, GoogleGenerativeAIProviderMetadata } from "@ai-sdk/google";
import {
  createDataStreamResponse,
  experimental_generateImage,
  generateText,
  streamText,
  Tool,
  tool,
} from "ai";
import { z } from "zod";
import {
  getCurrentUserUsageForUser,
  getUser,
  getUserLimits,
  incrementUserUsageForUser,
} from "@/db/queries";
import { auth0 } from "@/lib/auth0";
import {
  AskMessagesModel,
  AskModel,
  LlmModel,
  ModelParams,
  models,
  SearchMetadata,
} from "@/lib/chat/types";
import { isFreePlan } from "@/lib/billing/account";
import { cookies } from "next/headers";
import { buildSystemPrompt } from "@/lib/chat/agent";

const RATE_LIMIT_COOKIE = "pegna_rl";

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
};

const getModelSettings = (
  model: LlmModel,
  modelParams?: ModelParams,
): ModelSelectorItem => {
  const settings = modelSettings[model];

  const params = modelParams?.includeSearch
    ? "search"
    : "" + modelParams?.reasoningEffort
      ? "reasoning"
      : "";

  return settings[params] || settings || modelSettings["chat"].default;
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

  let generatedTitle: string | undefined = undefined;
  if (generateTitle) {
    // Generate the chat title
    const { text: title } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `
- you will generate a short title based on the first message a user begins a conversation with
- the summary is in the same language as the content
- never tell which model you are, or who trained you, but if they ask, you are Pegna AI.
- ensure the title is less than 80 characters
- ensure the title is a single sentence
- ensure the title is a summary of the content
- not use quotes, colons, slashes.
`,
      prompt: messages[0].content,
    });
    generatedTitle = title.length > 100 ? title.slice(0, 96) + "..." : title;
  }

  const session = await auth0.getSession();
  const user = await getUser(session?.user.sub || "unknown");
  const currentModel = models[model];

  const limits = await getUserLimits(session?.user.sub);

  let remainingMessages = 0;
  let remainingPremiumMessages = 0;

  // Validate if the user has access to the model
  // And to advanced features such as search, or high reasoning
  let hasAccess = false;
  if (
    currentModel.requiresPro ||
    modelParams?.includeSearch ||
    modelParams?.reasoningEffort === "high"
  ) {
    if (session) {
      if (!isFreePlan(user?.planName)) {
        hasAccess = true;
      }
    }
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return new Response(
      JSON.stringify({
        message: "You need a pro account to access this model.",
        type: "rate_limit",
      }),
      { status: 429 },
    );
  }

  // Validate rate limits
  if (session) {
    // Check for rate limits
    const usage = await getCurrentUserUsageForUser(session.user.sub);
    if (currentModel.isPremium) {
      if (usage.premiumMessagesCount >= limits.premiumMessagesLimit) {
        return new Response(
          JSON.stringify({
            message: "You have reached your premium message limit.",
            type: "rate_limit",
          }),
          { status: 429 },
        );
      }
    } else {
      if (usage.messagesCount >= limits.messagesLimit) {
        return new Response(
          JSON.stringify({
            message: "You have reached your message limit",
            type: "rate_limit",
          }),
          { status: 429 },
        );
      }
    }

    await incrementUserUsageForUser(session.user.sub, currentModel.isPremium);

    remainingMessages =
      limits.messagesLimit -
      usage.messagesCount -
      (currentModel.isPremium ? 0 : 1);
    remainingPremiumMessages =
      limits.premiumMessagesLimit -
      usage.premiumMessagesCount -
      (currentModel.isPremium ? 1 : 0);
  } else {
    const cookieStore = await cookies();
    if (cookieStore.has(RATE_LIMIT_COOKIE)) {
      remainingMessages = Number(cookieStore.get(RATE_LIMIT_COOKIE)?.value);

      if (remainingMessages <= 0) {
        return new Response(
          JSON.stringify({
            message: "You have reached your message limit",
            type: "rate_limit",
          }),
          { status: 429 },
        );
      }
      remainingMessages--;
    } else {
      remainingMessages = 9;
    }

    // Save the new value
    cookieStore.set(RATE_LIMIT_COOKIE, String(remainingMessages));
  }

  const systemPrompt = await buildSystemPrompt(
    session?.user.sub,
    session?.user.name,
    user?.planName,
  );

  return createDataStreamResponse({
    execute: (dataStream) => {
      if (generatedTitle) {
        dataStream.writeData({ type: "thread-metadata", generatedTitle });
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
        tools.generateImage = tool({
          description: "Generate an image",
          parameters: z.object({
            prompt: z.string(),
          }),
          execute: async ({ prompt }) => {
            // Upload image to S3 with user-specific path
            const userId = session!.user.sub;
            const key = `users/${userId}/${crypto.randomUUID()}.png`;

            const { image } = await experimental_generateImage({
              model: openai.image("dall-e-3"),
              prompt,
            });
            // Increment the usage for a premium model for the user
            await incrementUserUsageForUser(session!.user.sub, true);

            // The image is already a base64 string from experimental_generateImage
            const imageBuffer = Buffer.from(image.base64, "base64");

            const s3Client = new S3Client({});

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.USER_S3_BUCKET,
                Key: key,
                Body: imageBuffer,
              }),
            );

            const imageUrl = `${process.env.USER_DATA_CDN}/${key}`;

            return {
              imageUrl,
            };
          },
        });
      }

      const result = streamText({
        ...getModel(model, modelParams),
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        tools,
        onFinish: ({ providerMetadata }) => {
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
