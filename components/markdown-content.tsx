"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight as lightTheme,
  a11yDark as darkTheme,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

function MarkdownContent({ content }: MarkdownContentProps) {
  const { theme } = useTheme();

  const memoizedContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img(props) {
            const { alt, src } = props;
            if (src) {
              return (
                <Image
                  width={512}
                  height={512}
                  alt={alt || "Generated image"}
                  src={src}
                  className="rounded-xl border-8 mt-2 mb-2 border-secondary"
                />
              );
            } else {
              return (
                <>
                  <Image
                    width={1024}
                    height={1024}
                    alt={alt || "Generated image"}
                    src="/no-image.png"
                    className="rounded-xl border-8 mt-2 mb-2 border-secondary"
                  />
                  <span className="block text-destructive">
                    The image could not be rendered. Please try again.
                  </span>
                </>
              );
            }
          },

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
    ),
    [content, theme],
  );

  return memoizedContent;
}

export default memo(MarkdownContent);
