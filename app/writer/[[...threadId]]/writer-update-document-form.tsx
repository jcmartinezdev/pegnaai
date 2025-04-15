import { useThreadRouter } from "@/components/thread-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TextareaAutosize } from "@/components/ui/textarea";
import { documentTypes, PegnaDocument, WriterModel } from "@/lib/ai/types";
import { chatDB } from "@/lib/localDb";
import { SelectionRange } from "@uiw/react-codemirror";
import {
  ChevronDown,
  Languages,
  Megaphone,
  Send,
  Share2,
  Wand2,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

type NewDocumentFormParams = {
  prompt: string;
};

type WriterUpdateDocumentFormProps = {
  isStreaming: boolean;
  selectionRange: SelectionRange | null;
  onGenerateText: (ask: WriterModel) => Promise<void>;
};

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
];

const tones = ["Professional", "Casual", "Friendly", "Confident", "Persuasive"];

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
    return await generateText(data.prompt);
  };

  async function generateText(prompt: string, repurpose?: PegnaDocument) {
    if (isStreaming) {
      toast.warning("Please wait for the current generation to finish.");
      return;
    }
    // Save the user message to the DB
    const thread = await chatDB.getThread(threadId);

    await chatDB.addMessage({
      threadId: threadId,
      content: prompt,
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
      prompt: prompt,
      document: thread?.document || "",
      modelParams: {
        documentType: repurpose || thread?.modelParams.documentType,
        topic: thread?.modelParams.topic,
      },
      selectionRange: selectionRange
        ? {
            from: selectionRange.from,
            to: selectionRange.to,
          }
        : null,
      repurpose: repurpose !== undefined,
    });

    reset();
  }

  return (
    <div className="absolute bottom-0 w-full px-4 sm:px-0">
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => generateText("Check and fix grammar and spelling.")}
          >
            <Wand2 className="h-4 w-4" />
            <span>Grammar Check</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Languages className="h-4 w-4" />
                <span>Translate</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuGroup>
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language}
                    onClick={() => generateText(`Translate to ${language}`)}
                  >
                    <span>{language}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Megaphone className="h-4 w-4" />
                <span>Change Tone</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuGroup>
                {tones.map((tone) => (
                  <DropdownMenuItem
                    key={tone}
                    onClick={() =>
                      generateText(
                        `Change the tone of the text to be more ${tone}`,
                      )
                    }
                  >
                    <span>{tone}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Share2 className="h-4 w-4" />
                <span>Repurpose</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuGroup>
                {Object.keys(documentTypes).map((documentType) => (
                  <DropdownMenuItem
                    key={documentType}
                    onClick={() =>
                      generateText(
                        documentTypes[documentType as PegnaDocument]
                          .repurposePrompt,
                        documentType as PegnaDocument,
                      )
                    }
                  >
                    <span>
                      {documentTypes[documentType as PegnaDocument].name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectionRange && (
            <Badge>
              Selection: &#123;{selectionRange.from}:{selectionRange.to}&#125;
            </Badge>
          )}
        </div>
      </form>
    </div>
  );
}
