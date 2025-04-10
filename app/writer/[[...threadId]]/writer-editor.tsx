import Editor, { DiffEditor } from "@monaco-editor/react";
import { memo, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";

type WriterEditorProps = {
  document: string;
  proposedDiff?: string;
  onChange: (value?: string) => void;
};

function WriterEditor({ document, proposedDiff, onChange }: WriterEditorProps) {
  const debouncedHandleEditorChange = useDebouncedCallback(onChange, 500);

  const memoizedEditor = useMemo(() => {
    if (proposedDiff) {
      return (
        <DiffEditor
          original={document}
          modified={proposedDiff}
          options={{
            renderSideBySide: false,
            lineNumbers: "off",
            minimap: { enabled: false },
            wordWrap: "on",
            scrollbar: {
              verticalScrollbarSize: 5,
              vertical: "auto",
              verticalHasArrows: false,
            },
          }}
        />
      );
    } else {
      return (
        <Editor
          height="100%"
          language="markdown"
          value={document}
          onChange={debouncedHandleEditorChange}
          options={{
            lineNumbers: "off",
            extraEditorClassName: "max-w-xl",
            minimap: { enabled: false },
            wordWrap: "on",
            scrollbar: {
              verticalScrollbarSize: 5,
              vertical: "auto",
              verticalHasArrows: false,
            },
          }}
        />
      );
    }
  }, [document, proposedDiff, debouncedHandleEditorChange]);

  return memoizedEditor;
}

export default memo(WriterEditor);
