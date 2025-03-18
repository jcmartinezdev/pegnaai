import { models, LlmModel, ModelParams } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { AskMessagesModel, AskModel } from "@/lib/chat";

const askModelSchema = z.object({
  threadId: z.string(),
  model: z.enum(Object.keys(models) as [LlmModel, ...LlmModel[]]),
  modelParams: z.object({
    reasoningEffort: z.enum(["low", "high"] as const).optional(),
    includeSearch: z.boolean().optional(),
  }) satisfies z.ZodType<ModelParams>,
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
  const { success, data, error } = askModelSchema.safeParse(body);
  if (!success) {
    console.log("Invalid request", error);
    return new Response(
      JSON.stringify({ message: "Invalid request", type: "invalid_request" }),
      { status: 400 },
    );
  }
  const { threadId, model, modelParams, messages } = data;

  const llmModel = models[model];

  const getModel = () => {
    switch (llmModel.provider) {
      case "openai":
        return openai(llmModel.actualModel);
      case "anthropic":
        return anthropic(llmModel.actualModel);
    }

    return openai(llmModel.actualModel);
  };

  const result = streamText({
    model: getModel(),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return result.toDataStreamResponse();
}
