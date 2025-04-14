import { useThreadRouter } from "@/components/thread-router";
import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@/components/ui/textarea";
import { PegnaDocument, WriterModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { Send } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";

type NewDocumentFormParams = {
  prompt: string;
  topic: string;
  documentType: PegnaDocument;
};

type WriterNewDocumentFormProps = {
  isStreaming: boolean;
  onGenerateText: (ask: WriterModel) => Promise<void>;
};

export default function WriterNewDocumentForm({
  isStreaming,
  onGenerateText,
}: WriterNewDocumentFormProps) {
  const { navigateToThread } = useThreadRouter();
  const { register, handleSubmit, reset } = useForm<NewDocumentFormParams>({
    defaultValues: {
      prompt: "",
      topic: "",
      documentType: "Other",
    },
  });

  const onSubmit: SubmitHandler<NewDocumentFormParams> = async (data) => {
    // First, let's create the thread
    const newThreadId = await chatDB.createThread({
      title: "New Document",
      model: "writer",
      modelParams: {
        documentType: data.documentType,
        topic: data.topic,
      },
      app: "writer",
    });

    navigateToThread(newThreadId);

    // Save the user message to the DB
    await chatDB.addMessage({
      threadId: newThreadId,
      content: data.prompt,
      role: "user",
      status: "done",
      model: "writer",
      modelParams: {},
      synced: 0,
    });

    onGenerateText({
      threadId: newThreadId,
      generateTitle: true,
      prompt: data.prompt,
      document: "",
      modelParams: {
        documentType: data.documentType,
        topic: data.topic,
      },
    });

    reset();
  };

  return (
    <div className="flex h-full justify-center items-center">
      <form
        className="w-full max-w-4xl h-fit bg-accent rounded-xl border-2 p-3 shadow-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-start">
          <TextareaAutosize
            className="focus-visible:ring-0 border-0 shadow-none outline-none rounded-none resize-none p-0"
            minRows={1}
            maxRows={12}
            placeholder="What do you want me to write about?"
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
      </form>
    </div>
  );
}
