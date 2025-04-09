import { MessageModel } from "@/lib/localDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import MarkdownContent from "@/components/markdown-content";
import { MessageKind } from "@/lib/chat/types";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  message: MessageModel;
};

function LoadingChatContent({ kind }: { kind?: MessageKind }) {
  switch (kind) {
    case "image":
      return (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="animate-spin h-4 w-4" />
            Generating image...
          </div>
          <Skeleton className="rounded-xl h-96 w-96" />
        </div>
      );
    case "text":
    default:
      return (
        <div className="mt-4 flex text-sm gap-2 items-center text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Generating answer...
        </div>
      );
  }
}

export default function ChatContent({
  message: { content, kind, reasoning, searchMetadata, status },
}: Props) {
  return (
    <div>
      <div className="prose dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
        {reasoning && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="link" size="sm">
                Reasoning
                <ChevronDown />
                {status === "streaming" && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="bg-accent">
                <CardContent>{reasoning}</CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
        <MarkdownContent content={content} />
      </div>
      {searchMetadata && (
        <Card className="gap-2 mt-6">
          <CardHeader>
            <CardTitle>Search Sources</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert prose-pre:m-0">
            <ul>
              {searchMetadata
                ?.filter((sm) => sm.source)
                .sort((a, b) =>
                  (a?.confidenceScore || 0) > (b?.confidenceScore || 0)
                    ? -1
                    : 1,
                )
                .slice(0, 3)
                .map((sm, i) => (
                  <li key={i}>
                    <a target="_blank" href={sm.source!.url}>
                      {sm.source!.title}
                    </a>
                    {sm.snippet}
                    <Separator />
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {status === "streaming" && <LoadingChatContent kind={kind} />}
    </div>
  );
}
