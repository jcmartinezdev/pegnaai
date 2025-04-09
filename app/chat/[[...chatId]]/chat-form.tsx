import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useChatRouter } from "@/lib/chat/chatRouter";
import { Brain, Globe, Send } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { FormField } from "@/components/ui/form";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AskModel, LlmModel, ModelParams, models } from "@/lib/chat/types";
import { chatDB } from "@/lib/localDb";
import { isFreePlan } from "@/lib/billing/account";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import UnlockAllBanner from "./unlock-all-banner";
import { TextareaAutosize } from "@/components/ui/textarea";

type Props = {
  threadId: string;
  defaultModel?: LlmModel;
  defaultModelParams?: ModelParams;
  defaultText?: string;
  isStreaming: boolean;
  isLoggedIn: boolean;
  userPlan?: string;
  onProcessPegnaAIStream: (ask: AskModel) => Promise<void>;
  setRemainingLimits: (remainingLimits: number | undefined) => void;
};

type ChatFormInputs = {
  model: LlmModel;
  modelParams: ModelParams;
  content: string;
};

export default function ChatForm({
  isStreaming,
  threadId,
  defaultModel,
  defaultModelParams,
  defaultText,
  isLoggedIn,
  userPlan,
  onProcessPegnaAIStream,
  setRemainingLimits,
}: Props) {
  const { register, handleSubmit, control, reset, setValue, setFocus } =
    useForm<ChatFormInputs>({
      defaultValues: {
        model: defaultModel || "chat",
        modelParams: defaultModelParams || {},
      },
    });

  const model = useWatch({ control, name: "model" });

  useEffect(() => {
    setRemainingLimits(undefined);
    setFocus("content");
  }, [model, setRemainingLimits, setFocus]);

  useEffect(() => {
    setFocus("content");
  }, [threadId, setFocus]);

  useEffect(() => {
    setValue("model", defaultModel || "chat");
    if (defaultModelParams) {
      setValue("modelParams", defaultModelParams);
    }
  }, [defaultModel, defaultModelParams, setValue]);

  useEffect(() => {
    if (defaultText !== undefined) {
      setValue("content", defaultText);
      setFocus("content");
    }
  }, [defaultText, setValue, setFocus]);

  const { navigateToChat } = useChatRouter();

  const onSubmit: SubmitHandler<ChatFormInputs> = async (data) => {
    const modelParams = {};
    let saveThreadId = threadId;
    let generateTitle = false;

    if (!saveThreadId) {
      generateTitle = true;
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
      synced: 0,
    });

    onProcessPegnaAIStream({
      threadId: saveThreadId,
      model: data.model,
      modelParams: data.modelParams,
      messages: await chatDB.getAllMessagesForThread(saveThreadId),
      generateTitle: generateTitle ? true : undefined,
    });

    reset({
      ...data,
      content: "",
    });
  };

  const currentModel = models[model];

  return (
    <form
      className="mx-auto max-w-4xl bg-accent rounded-t-xl border-2 border-b-0 p-3 shadow-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex items-start">
        <TextareaAutosize
          className="focus-visible:ring-0 border-0 shadow-none outline-none rounded-none resize-none p-0"
          minRows={1}
          maxRows={12}
          placeholder="Ask me anything..."
          onKeyDown={(e) => {
            if (
              !e.nativeEvent.isComposing &&
              "Enter" === e.key &&
              !e.shiftKey
            ) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) {
                form.requestSubmit();
              }
            }
          }}
          {...register("content", { required: true })}
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          disabled={isStreaming}
        >
          <Send className="size-5 -ml-0.5 -mb-0.5" />
        </Button>
      </div>
      <div className="flex items-center">
        <div className="flex gap-2">
          <FormField
            control={control}
            name="model"
            render={({ field }) => (
              <ModelPicker
                isLoggedIn={isLoggedIn}
                userPlan={userPlan}
                selectedModel={field.value}
                onSelectModel={field.onChange}
              />
            )}
          />
          {isFreePlan(userPlan) && currentModel.allowSearch && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  className="hover:bg-blue-600/10 hover:text-blue-600 bg-transparent text-accent-foreground"
                >
                  <Globe />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-lg overflow-hidden border-2">
                <UnlockAllBanner
                  title="Unlock web search with Pegna Pro."
                  isLoggedIn={isLoggedIn}
                />
              </PopoverContent>
            </Popover>
          )}
          {!isFreePlan(userPlan) && currentModel.allowSearch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FormField
                      control={control}
                      name="modelParams.includeSearch"
                      render={({ field }) => (
                        <Button
                          type="button"
                          variant="default"
                          className={cn(
                            "hover:bg-blue-600/10 hover:text-blue-600",
                            field.value
                              ? "bg-blue-600/10 text-blue-600"
                              : "bg-transparent text-accent-foreground",
                          )}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <Globe />
                          <span className="hidden sm:inline">Search</span>
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
          {isFreePlan(userPlan) && currentModel.allowReasoning && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  className="hover:bg-blue-600/10 hover:text-blue-600 bg-transparent text-accent-foreground"
                >
                  <Brain />
                  <span className="hidden sm:inline">Think Hard</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-lg overflow-hidden border-2">
                <UnlockAllBanner
                  title="Unlock high reasoning with Pegna Pro."
                  isLoggedIn={isLoggedIn}
                />
              </PopoverContent>
            </Popover>
          )}
          {!isFreePlan(userPlan) && currentModel.allowReasoning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FormField
                      control={control}
                      name="modelParams.reasoningEffort"
                      render={({ field }) => (
                        <Button
                          type="button"
                          variant="default"
                          className={cn(
                            "hover:bg-blue-600/10 hover:text-blue-600",
                            field.value === "high"
                              ? "bg-blue-600/10 text-blue-600"
                              : "bg-transparent text-accent-foreground",
                          )}
                          onClick={() =>
                            field.onChange(
                              field.value === "high" ? "low" : "high",
                            )
                          }
                        >
                          <Brain />
                          <span className="hidden sm:inline">Think Hard</span>
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
      </div>
    </form>
  );
}
