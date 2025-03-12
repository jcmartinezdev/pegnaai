import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight as lightTheme,
  a11yDark as darkTheme,
} from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  content: string;
};

export default function ChatContent({ content }: Props) {
  const { theme } = useTheme();

  return (
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
  );
}
