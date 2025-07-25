"use client";

import { ToolCallPart, ToolResultPart } from "ai";
import { chatDB } from "../localDb";
import {
  AskModel,
  CustomMetadataType,
  FinishedStreamType,
  LlmModel,
  models,
  WriterModel,
} from "./types";

interface ResponsePegnaAIStream {
  success: boolean;
  remainingMessages?: number;
  error?: string;
}

/**
 * Sends a request to the PegnaAI API and processes the response.
 */
export async function askPegnaAI(ask: AskModel) {
  const responseMessageId = await chatDB.addMessage({
    threadId: ask.threadId,
    content: "",
    role: "assistant",
    status: "streaming",
    model: ask.model,
    modelParams: ask.modelParams,
    synced: 0,
  });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...ask }),
  });

  return await processPegnaAIStream(
    responseMessageId,
    ask.threadId,
    ask.model,
    response,
  );
}

export async function askPegnaAIToGenerateText(ask: WriterModel) {
  const responseMessageId = await chatDB.addMessage({
    threadId: ask.threadId,
    content: "",
    role: "assistant",
    status: "streaming",
    model: "writer",
    modelParams: ask.modelParams,
    synced: 0,
  });

  const response = await fetch("/api/writer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...ask }),
  });

  return await processPegnaAIStream(
    responseMessageId,
    ask.threadId,
    "writer",
    response,
  );
}

/**
 * Processes the PegnaAI stream response and updates the local database.
 */
async function processPegnaAIStream(
  responseMessageId: string,
  threadId: string,
  model: LlmModel,
  response: Response,
): Promise<ResponsePegnaAIStream> {
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
        synced: 0,
        updatedAt: new Date(),
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
      synced: 0,
      updatedAt: new Date(),
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
      synced: 0,
      updatedAt: new Date(),
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
            synced: 0,
            updatedAt: new Date(),
          });
          break;

        case "g":
          // Reasoning arrived
          console.log(`[STREAM][${op}]:`, content);
          await chatDB.messages.update(responseMessageId, {
            reasoning:
              (currentMessage?.reasoning || "") + content.replace(/^"|"$/g, ""),
            status: "streaming",
            synced: 0,
            updatedAt: new Date(),
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
                    await chatDB.threads.update(threadId, {
                      title: data.generatedTitle,
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "search-metadata":
                    await chatDB.messages.update(responseMessageId, {
                      searchMetadata: data.value,
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "rate-limit":
                    remainingMessages = models[model].isPremium
                      ? data.value.remainingPremiumMessages
                      : data.value.remainingMessages;
                    break;
                  case "message-kind":
                    await chatDB.messages.update(responseMessageId, {
                      kind: data.value.kind,
                      status: "streaming-image",
                      updatedAt: new Date(),
                    });
                    break;
                  case "document-clear":
                    await chatDB.threads.update(threadId, {
                      documentProposedDiff: "",
                      repurposeDocument: "",
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "document-delta":
                    await chatDB.threads.update(threadId, {
                      document:
                        ((await chatDB.threads.get(threadId))?.document || "") +
                        data.delta.replace(/^"|"$/g, ""),
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "document-diff-delta":
                    await chatDB.threads.update(threadId, {
                      documentProposedDiff:
                        ((await chatDB.threads.get(threadId))
                          ?.documentProposedDiff || "") +
                        data.delta.replace(/^"|"$/g, ""),
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "document-diff-completed":
                    const ct = await chatDB.threads.get(threadId);
                    if (!ct?.document || ct.document.length === 0) {
                      await chatDB.threads.update(threadId, {
                        document: ct?.documentProposedDiff,
                        documentProposedDiff: "",
                        synced: 0,
                        updatedAt: new Date(),
                      });
                    }
                    break;

                  case "document-rep-delta":
                    await chatDB.threads.update(threadId, {
                      repurposeDocument:
                        ((await chatDB.threads.get(threadId))
                          ?.repurposeDocument || "") +
                        data.delta.replace(/^"|"$/g, ""),
                      synced: 0,
                      updatedAt: new Date(),
                    });
                    break;
                  case "tool-image-url":
                    const toolImage = currentMessage?.toolResponses?.find(
                      (tr) => tr.toolName === "generateImage",
                    );
                    if (toolImage) {
                      const updatedToolResponses =
                        currentMessage!.toolResponses!.map((tr) => {
                          if (tr.toolCallId === toolImage.toolCallId) {
                            return {
                              ...tr,
                              generateImage: {
                                ...tr.generateImage,
                                url: data.value.url,
                              },
                            };
                          }
                          return tr;
                        });
                      await chatDB.messages.update(responseMessageId, {
                        content:
                          (currentMessage?.content || "") +
                          `![${data.value.prompt}](${data.value.url})\n`,
                        status: "streaming",
                        toolResponses: updatedToolResponses,
                        synced: 0,
                        updatedAt: new Date(),
                      });
                    } else {
                      console.error(
                        `[STREAM] Tool image URL not found for ${data.value.url}`,
                      );
                    }
                    break;
                }
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
            synced: 0,
            updatedAt: new Date(),
          });
          break;

        case "9": {
          // Tool call
          const data = content as unknown as ToolCallPart;
          console.log(`[STREAM][${op}]:`, data);
          switch (data.toolName) {
            case "generateImage":
              const toolResult = data.args as unknown as {
                prompt: string;
              };
              const toolResponses = currentMessage?.toolResponses || [];
              toolResponses.push({
                toolCallId: data.toolCallId,
                toolName: data.toolName,
                generateImage: {
                  prompt: toolResult?.prompt,
                },
              });
              await chatDB.messages.update(responseMessageId, {
                toolResponses,
                synced: 0,
                updatedAt: new Date(),
              });
              break;
          }
          break;
        }

        case "a": {
          // Tool call result
          const data = content as unknown as ToolResultPart;
          console.log(`[STREAM][${op}]:`, data);
          const toolResult = data.result as unknown as {
            result: string;
          };
          const toolResponses = currentMessage?.toolResponses || [];
          const currentToolResponse = toolResponses.find(
            (tr) => tr.toolCallId === data.toolCallId,
          );
          if (!currentToolResponse) {
            console.error(
              `[STREAM] Tool call result not found for ${data.toolCallId}`,
            );
            await chatDB.messages.update(responseMessageId, {
              status: "error",
              content: "Error generating the image. Please try again later.",
              synced: 0,
              updatedAt: new Date(),
            });
            break;
          }

          const updatedToolResponses = toolResponses.map((tr) => {
            if (tr.toolCallId === data.toolCallId) {
              return {
                ...tr,
                generateImage: {
                  ...tr.generateImage,
                  result: toolResult?.result,
                },
              };
            }
            return tr;
          });

          await chatDB.messages.update(responseMessageId, {
            toolResponses: updatedToolResponses,
            synced: 0,
            updatedAt: new Date(),
          });
          break;
        }

        case "d":
          // Done
          try {
            const data = content as FinishedStreamType;
            console.log(`[STREAM][${op}]:`, data);
            const finishReason = data.finishReason || "unknown";

            switch (finishReason) {
              case "stop":
              case "tool-calls":
                await chatDB.markMessageDone(responseMessageId, threadId);
                break;
              case "length":
                await chatDB.markMessageDone(
                  responseMessageId,
                  threadId,
                  "\n\n **Message too long, stopping here.**",
                );
                break;
              case "content-filter":
                await chatDB.markMessageDone(
                  responseMessageId,
                  threadId,
                  "\n\n **Our models flagged your prompt. Please edit your last message or start a new thread.**",
                );
                break;
              case "error":
                await chatDB.messages.update(responseMessageId, {
                  status: "error",
                  content: "Error processing the request. Please try again.",
                  synced: 0,
                  updatedAt: new Date(),
                });
                return {
                  success: false,
                  error: "Model returned an error",
                };
              default:
                await chatDB.messages.update(responseMessageId, {
                  status: "error",
                  content: "Error processing the request. Please try again.",
                  synced: 0,
                  updatedAt: new Date(),
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
              synced: 0,
              updatedAt: new Date(),
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
