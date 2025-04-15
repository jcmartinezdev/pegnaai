import { useThreadRouter } from "@/components/thread-router";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { TextareaAutosize } from "@/components/ui/textarea";
import { documentTypes, PegnaDocument, WriterModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { Send } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type WriterNewDocumentFormProps = {
  isStreaming: boolean;
  onGenerateText: (ask: WriterModel) => Promise<void>;
};

const newDocumentFormSchema = z.object({
  prompt: z.string().min(2, {
    message: "Please enter a prompt",
  }),
  topic: z.string().optional(),
  documentType: z.enum(
    Object.keys(documentTypes) as [PegnaDocument, ...PegnaDocument[]],
    {
      message: "Please select a document type",
    },
  ),
});

export default function WriterNewDocumentForm({
  isStreaming,
  onGenerateText,
}: WriterNewDocumentFormProps) {
  const { navigateToThread } = useThreadRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof newDocumentFormSchema>>({
    resolver: zodResolver(newDocumentFormSchema),
    defaultValues: {
      prompt: "",
      topic: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof newDocumentFormSchema>> = async (
    data,
  ) => {
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
      modelParams: {
        documentType: data.documentType,
        topic: data.topic,
      },
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
    <div className="flex flex-col h-full justify-center items-center px-4 gap-4">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="w-full max-w-4xl h-fit">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <ul>
              {Object.values(errors)
                .filter((error) => error) // Filter out any potentially undefined messages
                .map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <form
        className="w-full max-w-4xl h-fit bg-accent rounded-xl border-2 p-3 shadow-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-start">
          <TextareaAutosize
            autoFocus
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
            {...register("prompt")}
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
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name="documentType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-42">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(documentTypes).map((key) => (
                    <SelectItem key={key} value={key}>
                      {documentTypes[key as PegnaDocument].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </form>
    </div>
  );
}
