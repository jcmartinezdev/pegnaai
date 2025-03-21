import { SearchMetadata } from "@/lib/db";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight as lightTheme,
  a11yDark as darkTheme,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

type Props = {
  content: string;
  searchMetadata?: SearchMetadata[];
};

export default function ChatContent({ content, searchMetadata }: Props) {
  const { theme } = useTheme();

  return (
    <div>
      <div className="prose dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
        <ReactMarkdown
          components={{
            code(props) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { children, className, node, ref, ...rest } = props;
              const match = /language-(\w+)/.exec(className || "");

              if (match) {
                return (
                  <div className="relative mt-2 flex w-full flex-col">
                    <div className="flex w-full items-center justify-between rounded-t px-4 py-2 text-sm bg-secondary text-primary border-b border-zinc-200 dark:border-zinc-600">
                      <span className="font-mono">{match[1]}</span>
                    </div>
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      language={match[1]}
                      style={theme === "light" ? lightTheme : darkTheme}
                      className="!bg-secondary !mt-0 !rounded-t-none"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              if (!String(children).includes("\n")) {
                return (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                );
              }

              return (
                <div className="relative mt-2 flex w-full flex-col">
                  <div className="flex w-full items-center justify-between rounded-t px-4 py-2 text-sm bg-secondary text-primary border-b border-zinc-200 dark:border-zinc-600">
                    <span className="font-mono">text</span>
                  </div>
                  <code
                    {...rest}
                    className="bg-secondary text-primary p-4 w-full overflow-auto"
                  >
                    {children}
                  </code>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
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
    </div>
  );
}
