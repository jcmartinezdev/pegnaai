import { memo, useEffect, useMemo, useRef } from "react";
import CodeMirror, {
  ReactCodeMirrorRef,
  Statistics,
} from "@uiw/react-codemirror";
import CodeMirrorMerge from "react-codemirror-merge";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { useDebouncedCallback } from "use-debounce";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Button } from "@/components/ui/button";
import hyperlinkExtension from "@/components/code-mirror/code-mirror-links-extension";
import imageExtension from "@/components/code-mirror/code-mirror-image-extension";
import WriterEditorToolbar from "./writer-editor-toolbar";

type WriterEditorProps = {
  isStreaming?: boolean;
  document: string;
  proposedDiff?: string;
  readOnly?: boolean;
  onChange: (value?: string) => void;
  onRejectProposal?: () => void;
  onStatsChange?: (stats: Statistics) => void;
};

const markdownHighlightStyle = HighlightStyle.define([
  {
    tag: tags.heading1,
    class: "text-xl font-bold tracking-tigh cm-h1",
  },
  {
    tag: tags.heading2,
    class: "text-xl font-bold tracking-tigh cm-h2",
  },
  {
    tag: tags.heading,
    class: "font-bold tracking-tigh cm-h",
  },
  {
    tag: tags.emphasis,
    class: "italic",
  },
  {
    tag: tags.strikethrough,
    class: "line-through",
  },
  { tag: tags.keyword, class: "text-blue-700 dark:text-blue-300" },
  { tag: [tags.literal, tags.inserted], color: "#164" },
  { tag: [tags.string, tags.deleted], class: "text-red-500" },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], color: "#e40" },
  { tag: tags.definition(tags.variableName), class: "text-foreground" },
  { tag: tags.local(tags.variableName), color: "#30a" },
  { tag: [tags.typeName, tags.namespace], color: "#085" },
  { tag: tags.className, color: "#167" },
  { tag: [tags.special(tags.variableName), tags.macroName], color: "#256" },
  { tag: tags.definition(tags.propertyName), color: "#00c" },
  { tag: tags.comment, color: "#940" },
  { tag: tags.invalid, color: "#f00" },
  {
    tag: tags.strong,
    class: "font-bold",
  },
  {
    tag: tags.list,
    class: "cm-list",
  },
  {
    tag: [
      tags.atom,
      tags.bool,
      tags.url,
      tags.contentSeparator,
      tags.labelName,
    ],
    class: "text-primary",
  },
  {
    tag: tags.processingInstruction,
    class: "text-muted-foreground!",
  },
]);

const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
  EditorView.theme({
    "&.cm-editor": {
      backgroundColor: "var(--background)",
      color: "var(--text)",
      maxWidth: "var(--container-5xl)",
      margin: "0 auto",
    },
    "&.cm-editor.cm-focused": {
      outline: "none",
    },
    "&.cm-editor .cm-line": {
      paddingLeft: "5rem",
      paddingRight: "5rem",
      caretColor: "var(--primary) !important",
    },
    "& .cm-selectionMatch, & .cm-searchMatch": {
      display: "inline-block",
      backgroundColor: "color-mix(in oklab, var(--primary) 50%, transparent)",
    },
    "&.cm-editor .cm-line ::selection": {
      backgroundColor:
        "color-mix(in oklab, var(--primary) 50%, transparent) !important",
    },
    "& .cm-activeLine": {
      backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
    },
    "& .cm-line:has(.cm-list)": {
      paddingLeft: "6.5rem",
      paddingRight: "5rem",
    },
    "& .cm-line:has(.cm-list) > :first-child": {
      marginLeft: "-1.5rem",
    },
    "& .cm-line:has(.cm-h1) > :first-child": {
      marginLeft: "-1.5rem",
    },
    "& .cm-line:has(.cm-h2) > :first-child": {
      marginLeft: "-2.2rem",
    },
    "& .cm-line:has(.cm-h) > :first-child": {
      marginLeft: "-2.8rem",
    },
  }),
  syntaxHighlighting(markdownHighlightStyle),
  hyperlinkExtension(),
  imageExtension(),
];

function WriterEditor({
  isStreaming,
  document,
  readOnly,
  proposedDiff,
  onChange,
  onRejectProposal,
  onStatsChange,
}: WriterEditorProps) {
  const debouncedHandleEditorChange = useDebouncedCallback(onChange, 500);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const memoizedEditor = useMemo(() => {
    console.log("Rendering WriterEditor");
    if (proposedDiff && proposedDiff.length > 0 && proposedDiff !== document) {
      return (
        <>
          <div className="flex w-full items-stretch border-b mb-2 pb-2">
            <div className="flex-grow">
              <div className="mx-auto max-w-5xl text-xl flex justify-between items-center">
                Original
                <Button
                  variant="destructive"
                  disabled={isStreaming}
                  onClick={onRejectProposal}
                >
                  Discard Proposal
                </Button>
              </div>
            </div>
            <div className="w-12">&nbsp;</div>
            <div className="flex-grow">
              <div className="mx-auto max-w-5xl text-xl flex justify-between items-center">
                Proposal
                <Button
                  disabled={isStreaming}
                  onClick={() => {
                    debouncedHandleEditorChange(proposedDiff);
                  }}
                >
                  Accept Full Proposal
                </Button>
              </div>
            </div>
          </div>
          <CodeMirrorMerge
            className="text-lg"
            gutter={true}
            revertControls="b-to-a"
            destroyRerender={false}
          >
            <CodeMirrorMerge.Original
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightSelectionMatches: false,
              }}
              onChange={debouncedHandleEditorChange}
              readOnly={isStreaming}
              value={document}
              extensions={extensions}
            />
            <CodeMirrorMerge.Modified
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightSelectionMatches: false,
              }}
              readOnly={true}
              value={proposedDiff}
              extensions={extensions}
            />
          </CodeMirrorMerge>
        </>
      );
    }
    return (
      <>
        <WriterEditorToolbar view={editorRef.current?.view} />
        <div className="overflow-y-auto mt-2 pb-48 md:pb-32">
          <CodeMirror
            ref={editorRef}
            value={document}
            onChange={debouncedHandleEditorChange}
            className="text-lg"
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightSelectionMatches: false,
            }}
            readOnly={isStreaming || readOnly}
            height="100%"
            extensions={extensions}
            onStatistics={onStatsChange}
          />
        </div>
      </>
    );
  }, [
    onStatsChange,
    readOnly,
    document,
    proposedDiff,
    debouncedHandleEditorChange,
    onRejectProposal,
    isStreaming,
    editorRef.current,
  ]);

  return memoizedEditor;
}

export default WriterEditor;
