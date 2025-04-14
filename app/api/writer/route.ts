import { createDataStreamResponse, streamText } from "ai";
import { z } from "zod";
import {
  documentTypes,
  ModelParams,
  models,
  PegnaDocument,
  WriterModel,
} from "@/lib/ai/types";
import { buildWriterSystemPrompt, generateThreadTitle } from "@/lib/ai/agent";
import { validateRateLimits } from "@/lib/billing/rate-limits";
import { openai } from "@ai-sdk/openai";

const askModelSchema = z.object({
  threadId: z.string(),
  generateTitle: z.boolean().optional(),
  modelParams: z.object({
    documentType: z.enum(
      Object.keys(documentTypes) as [PegnaDocument, ...PegnaDocument[]],
    ),
    topic: z.string().optional(),
  }) satisfies z.ZodType<ModelParams>,
  prompt: z.string(),
  document: z.string(),
  topic: z.string().optional(),
}) satisfies z.ZodType<WriterModel>;

export async function POST(req: Request) {
  const body = await req.json();
  const { success, data, error } = askModelSchema.safeParse(body);
  if (!success) {
    return new Response(
      JSON.stringify({ message: "Invalid request", type: "invalid_request" }),
      { status: 400 },
    );
  }
  const { generateTitle, prompt, document, modelParams } = data;

  let remainingMessages = 0;
  let remainingPremiumMessages = 0;
  try {
    const result = await validateRateLimits(models["writer"], {});
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

  const systemPrompt = await buildWriterSystemPrompt(document, modelParams);

  const pendingPromises: Promise<any>[] = [];

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeData({
        type: "document-clear",
      });
      if (generateTitle) {
        // Generate the chat title
        pendingPromises.push(
          generateThreadTitle(prompt).then((title) => {
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

      const { fullStream } = streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: prompt,
        onFinish: async () => {
          await Promise.all(pendingPromises);
        },
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { textDelta } = delta;

          dataStream.writeData({
            type:
              document.length === 0 ? "document-delta" : "document-diff-delta",
            delta: textDelta,
          });
        }
      }
    },
    onError: (error) => {
      console.log("Error", error);
      return "There was an error with the request";
    },
  });
}
