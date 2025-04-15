import { useThreadRouter } from "@/components/thread-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@/components/ui/textarea";
import { WriterModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { SelectionRange } from "@uiw/react-codemirror";
import { Send } from "lucide-react";
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type NewDocumentFormParams = {
  prompt: string;
};

type WriterUpdateDocumentFormProps = {
  isStreaming: boolean;
  selectionRange: SelectionRange | null;
  onGenerateText: (ask: WriterModel) => Promise<void>;
};

export default function WriterUpdateDocumentForm({
  isStreaming,
  onGenerateText,
  selectionRange,
}: WriterUpdateDocumentFormProps) {
  const { threadId } = useThreadRouter();
  const { register, handleSubmit, reset, setFocus } =
    useForm<NewDocumentFormParams>({
      defaultValues: {
        prompt: "",
      },
    });

  useEffect(() => {
    setFocus("prompt");
  }, [setFocus, threadId]);

  const onSubmit: SubmitHandler<NewDocumentFormParams> = async (data) => {
    // Save the user message to the DB
    const thread = await chatDB.getThread(threadId);

    await chatDB.addMessage({
      threadId: threadId,
      content: data.prompt,
      role: "user",
      status: "done",
      model: "writer",
      modelParams: {
        documentType: thread?.modelParams.documentType,
        topic: thread?.modelParams.topic,
      },
      synced: 0,
    });

    onGenerateText({
      threadId: threadId,
      prompt: data.prompt,
      document: thread?.document || "",
      modelParams: {
        documentType: thread?.modelParams.documentType,
        topic: thread?.modelParams.topic,
      },
      selectionRange: selectionRange
        ? {
            from: selectionRange.from,
            to: selectionRange.to,
          }
        : null,
    });

    reset();
  };

  return (
    <div className="absolute bottom-0 w-full px-4">
      <form
        className="w-full mx-auto max-w-4xl bg-accent rounded-t-xl border-2 border-b-0 p-3 shadow-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-start">
          <TextareaAutosize
            className="focus-visible:ring-0 border-0 shadow-none outline-none rounded-none resize-none p-0"
            minRows={1}
            maxRows={12}
            placeholder="Tell me what you'd like to change, and I'll get to it!"
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
            {...register("prompt", { required: true })}
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
            {selectionRange && (
              <Badge>
                Selection: &#123;{selectionRange.from}:{selectionRange.to}&#125;
              </Badge>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
