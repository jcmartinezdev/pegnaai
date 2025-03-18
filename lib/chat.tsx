import { chatDB, LlmModel, ModelParams } from "./db";

interface FinishedStreamType {
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
  model: LlmModel;
  modelParams: ModelParams;
  messages: AskMessagesModel[];
}

interface ResponseModel {
  success: boolean;
  error?: string;
}

export default async function askNextChat(
  ask: AskModel,
): Promise<ResponseModel> {
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

    const result = await response.json();
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
      console.log(`[${op}] ${content}`);

      const currentMessage = await chatDB.messages.get(responseMessageId);

      switch (op) {
        case "0":
          // Text arrived
          await chatDB.messages.update(responseMessageId, {
            content:
              (currentMessage?.content || "") + content.replace(/^"|"$/g, ""),
            status: "streaming",
          });
          break;

        case "3":
          // Text arrived
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
            };
          }
          break;
      }
    }
  }

  return {
    success: true,
  };
}
