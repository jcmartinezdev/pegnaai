import askNextChat from "@/lib/chat";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { chatDB, LlmModel, ModelParams, models } from "@/lib/db";
import { useChatRouter } from "@/lib/chatRouter";
import { Brain, Globe, Send } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { FormField } from "./ui/form";
import { Tooltip, TooltipProvider } from "./ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useEffect } from "react";

type Props = {
  threadId: string;
  defaultModel?: LlmModel;
  defaultModelParams?: ModelParams;
};

type ChatFormInputs = {
  model: LlmModel;
  modelParams: ModelParams;
  content: string;
};

export default function ChatForm({
  threadId,
  defaultModel,
  defaultModelParams,
}: Props) {
  const { register, handleSubmit, control, reset, watch, setValue } =
    useForm<ChatFormInputs>({
      defaultValues: {
        model: defaultModel || "fast",
        modelParams: defaultModelParams || {},
      },
    });

  useEffect(() => {
    setValue("model", defaultModel || "fast");
    if (defaultModelParams) {
      setValue("modelParams", defaultModelParams);
    }
  }, [defaultModel, defaultModelParams]);

  const { navigateToChat } = useChatRouter();

  const onSubmit: SubmitHandler<ChatFormInputs> = async (data) => {
    const modelParams = {};
    let saveThreadId = threadId;

    if (!saveThreadId) {
      const newThreadId = await chatDB.createThread({
        title: "New Chat",
        model: data.model,
        modelParams: data.modelParams,
      });

      saveThreadId = newThreadId;
      navigateToChat(newThreadId);
    }

    // Save the user message to the DB
    await chatDB.addMessage({
      threadId: saveThreadId,
      content: data.content,
      role: "user",
      status: "done",
      model: data.model,
      modelParams,
    });

    askNextChat({
      threadId: saveThreadId,
      model: data.model,
      modelParams,
      messages: await chatDB.getAllMessages(saveThreadId),
    });

    reset({
      ...data,
      content: "",
    });
  };

  const currentModel = models[watch("model")];

  return (
    <form
      className="mx-auto max-w-4xl bg-accent rounded-t-xl border-2 border-b-0 p-3 shadow-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Textarea
        className="focus-visible:ring-0 border-0 shadow-none outline-none rounded-none resize-none p-0"
        placeholder="Ask me anything..."
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing && "Enter" === e.key && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
              form.requestSubmit();
            }
          }
        }}
        {...register("content", { required: true })}
      />
      <div className="flex items-center">
        <div className="flex gap-2">
          <FormField
            control={control}
            name="model"
            render={({ field }) => (
              <ModelPicker
                selectedModel={field.value}
                onSelectModel={field.onChange}
              />
            )}
          />
          {currentModel.allowSearch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FormField
                      control={control}
                      name="modelParams.includeSearch"
                      render={({ field }) => (
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <Globe
                            className={`size-5 ${field.value ? "text-blue-600/70" : ""}`}
                          />
                        </Button>
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2 bg-neutral-900 text-neutral-100 rounded-lg shadow-lg">
                    Search the web to provide better answers.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {currentModel.allowReasoning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FormField
                      control={control}
                      name="modelParams.reasoningEffort"
                      render={({ field }) => (
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            field.onChange(
                              field.value === "high" ? "low" : "high",
                            )
                          }
                        >
                          <Brain
                            className={`size-5 ${field.value === "high" ? "text-blue-600/70" : ""}`}
                          />
                        </Button>
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2 bg-neutral-900 text-neutral-100 rounded-lg shadow-lg">
                    Think harder before answering.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex-grow"></div>
        <Button
          type="submit"
          variant="outline"
          size="icon"
          className="rounded-full bg-blue-600/70 p-2 text-neutral-100 hover:text-neutral-100 hover:bg-blue-500/70"
        >
          <Send className="size-5 -ml-0.5 -mb-0.5" />
        </Button>
      </div>
    </form>
  );
}
