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
import { google } from "@ai-sdk/google";

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
  selectionRange: z
    .object({
      from: z.number(),
      to: z.number(),
    })
    .optional()
    .nullable(),
  repurpose: z.boolean().optional(),
}) satisfies z.ZodType<WriterModel>;

export async function POST(req: Request) {
  const body = await req.json();
  const { success, data, error } = askModelSchema.safeParse(body);
  if (!success) {
    console.log("Error parsing request", error);
    return new Response(
      JSON.stringify({ message: "Invalid request", type: "invalid_request" }),
      { status: 400 },
    );
  }
  const {
    generateTitle,
    prompt,
    document,
    modelParams,
    selectionRange,
    repurpose,
  } = data;

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

  const systemPrompt = await buildWriterSystemPrompt(
    document,
    modelParams,
    selectionRange,
  );

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

      if (selectionRange) {
        dataStream.writeData({
          type: "document-diff-delta",
          delta: document.slice(0, selectionRange.from),
        });
      }

      const result = streamText({
        model: google("gemini-2.0-flash"),
        system: systemPrompt,
        prompt: prompt,
        maxTokens: 1_000_000,
        onFinish: async () => {
          await Promise.all(pendingPromises);

          if (selectionRange) {
            dataStream.writeData({
              type: "document-diff-delta",
              delta: document.slice(selectionRange.to, document.length),
            });
          }
        },
      });

      for await (const delta of result.fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { textDelta } = delta;

          if (repurpose) {
            dataStream.writeData({
              type: "document-rep-delta",
              delta: textDelta,
            });
          } else {
            dataStream.writeData({
              type:
                document.length === 0
                  ? "document-delta"
                  : "document-diff-delta",
              delta: textDelta,
            });
          }
        }
      }

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
