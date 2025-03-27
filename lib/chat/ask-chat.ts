"use client";

import { chatDB } from "../localDb";
import {
  AskModel,
  CustomMetadataType,
  FinishedStreamType,
  models,
} from "./types";

interface ResponsePegnaAIStream {
  success: boolean;
  remainingMessages?: number;
  error?: string;
}

export default async function processPegnaAIStream(
  ask: AskModel,
): Promise<ResponsePegnaAIStream> {
  const responseMessageId = await chatDB.addMessage({
    threadId: ask.threadId,
    content: "",
    role: "assistant",
    status: "streaming",
    model: ask.model,
    modelParams: ask.modelParams,
  });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...ask }),
  });

  if (!response.ok) {
    console.error("[STREAM] Failed to fetch response", response);

    let result = {
      type: "internal_server_error",
      message: "Internal Server Error",
    };
    try {
      result = await response.json();
    } catch {}

    if (result.type === "rate_limit") {
      await chatDB.messages.update(responseMessageId, {
        status: "error",
        content: result.message,
        serverError: result,
      });

      return {
        success: false,
        error: result.message,
        remainingMessages: 0,
      };
    }

    await chatDB.messages.update(responseMessageId, {
      status: "error",
      content: "Failed to fetch response",
      serverError: result,
    });

    return {
      success: false,
      error: "Failed to fetch response",
    };
  }

  const content = response.body;
  const reader = content?.getReader();

  if (!reader) {
    console.error("[STREAM] Failed to read response", response);

    await chatDB.messages.update(responseMessageId, {
      status: "error",
      content: "Failed to read response",
      serverError: {
        message: "No reader available from response.",
        type: "no_reader",
      },
    });

    return {
      success: false,
      error: "No reader available from response.",
    };
  }
  const textDecoder = new TextDecoder();
  let remainingMessages: number | undefined = undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    for (const line of textDecoder.decode(value).split("\n").filter(Boolean)) {
      const op = line[0];
      const contentLine = line.slice(2).trim();
      let content = contentLine;
      try {
        content = JSON.parse(contentLine);
      } catch {
        content = contentLine.replace(/^"|"$/g, "");
      }

      const currentMessage = await chatDB.messages.get(responseMessageId);

      switch (op) {
        case "0":
          // Text arrived
          console.log(`[STREAM][${op}]:`, content);
          await chatDB.messages.update(responseMessageId, {
            content:
              (currentMessage?.content || "") + content.replace(/^"|"$/g, ""),
            status: "streaming",
          });
          break;

        case "g":
          // Reasoning arrived
          console.log(`[STREAM][${op}]:`, content);
          await chatDB.messages.update(responseMessageId, {
            reasoning:
              (currentMessage?.reasoning || "") + content.replace(/^"|"$/g, ""),
            status: "streaming",
          });
          break;

        case "2":
          // Custom data arrived
          try {
            if (typeof content === "object") {
              for (const o of content as []) {
                const data = o as CustomMetadataType;
                console.log(`[STREAM][${op}]:`, data);
                switch (data.type) {
                  case "thread-metadata":
                    await chatDB.threads.update(ask.threadId, {
                      title: data.generatedTitle,
                    });
                    break;
                  case "search-metadata":
                    await chatDB.messages.update(responseMessageId, {
                      searchMetadata: data.value,
                    });
                    break;
                  case "rate-limit":
                    remainingMessages = models[ask.model].isPremium
                      ? data.value.remainingPremiumMessages
                      : data.value.remainingMessages;
                    break;
                }
                break;
              }
            }
          } catch (error) {
            console.error("[STREAM] Error parsing data chunk JSON:", error);
          }
          break;

        case "3":
          // Ups... something went wrong
          console.log(`[STREAM][${op}]:`, content);
          await chatDB.messages.update(responseMessageId, {
            content:
              (currentMessage?.content || "") + content.replace(/^"|"$/g, ""),
            status: "error",
          });
          break;

        case "d":
          // Done
          try {
            const data = content as FinishedStreamType;
            console.log(`[STREAM][${op}]:`, data);
            const finishReason = data.finishReason || "unknown";

            switch (finishReason) {
              case "stop":
                await chatDB.markMessageDone(responseMessageId, ask.threadId);
                break;
              case "length":
                await chatDB.markMessageDone(
                  responseMessageId,
                  ask.threadId,
                  "\n\n **Message too long, stopping here.**",
                );
                break;
              case "content-filter":
                await chatDB.markMessageDone(
                  responseMessageId,
                  ask.threadId,
                  "\n\n **Our models flagged your prompt. Please edit your last message or start a new thread.**",
                );
                break;
              case "error":
                await chatDB.messages.update(responseMessageId, {
                  status: "error",
                  content: "Error processing the request. Please try again.",
                });
                return {
                  success: false,
                  error: "Model returned an error",
                };
              default:
                await chatDB.messages.update(responseMessageId, {
                  status: "error",
                  content: "Error processing the request. Please try again.",
                });
                return {
                  success: false,
                  error: "Unknown finish reason",
                  remainingMessages,
                };
            }
          } catch (error) {
            console.error("[STREAM] Error parsing data chunk JSON:", error);
            await chatDB.messages.update(responseMessageId, {
              status: "error",
              content: "Error processing the request. Please try again.",
            });
            return {
              success: false,
              error: "Error parsing data chunk JSON",
              remainingMessages,
            };
          }
          break;
      }
    }
  }

  return {
    success: true,
    remainingMessages,
  };
}
