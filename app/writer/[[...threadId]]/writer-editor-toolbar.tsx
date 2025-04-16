import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@uiw/react-codemirror";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Italic,
  Link,
  Quote,
} from "lucide-react";

interface WriterEditorToolbarProps {
  view?: EditorView;
}

function toggleWrapSelection(view: EditorView, wrapWith: string) {
  const currentRange = view.state.selection.main;
  const wrapWithLength = wrapWith.length;

  // Let's check if we need to unwrap first
  if (currentRange.from >= wrapWithLength) {
    const charStart = view.state.sliceDoc(
      currentRange.from - wrapWithLength,
      currentRange.from,
    );
    const chatEnd = view.state.sliceDoc(
      currentRange.to,
      currentRange.to + wrapWithLength,
    );

    if (charStart === wrapWith && chatEnd === wrapWith) {
      view.dispatch(
        view.state.changeByRange((range) => {
          return {
            changes: [
              { from: range.from - wrapWithLength, to: range.from },
              { from: range.to, to: range.to + wrapWithLength },
            ],
            range: EditorSelection.range(
              range.from - wrapWithLength,
              range.to - wrapWithLength,
            ),
          };
        }),
      );

      view.focus();
      return true;
    }
  }

  view.dispatch(
    view.state.changeByRange((range) => {
      return {
        changes: [
          { from: range.from, insert: wrapWith },
          { from: range.to, insert: wrapWith },
        ],
        range: EditorSelection.range(
          range.from + wrapWithLength,
          range.to + wrapWithLength,
        ),
      };
    }),
  );

  view.focus();
  return true;
}

function toggleLink(view: EditorView, startsWith: string = "[") {
  view.dispatch(
    view.state.changeByRange((range) => {
      const text = view.state.sliceDoc(range.from, range.to);
      const link = `${startsWith}${text}]()`;

      const cursor = range.from + link.length - 1;

      return {
        changes: [
          {
            from: range.from,
            to: range.to,
            insert: link,
          },
        ],
        range: EditorSelection.range(cursor, cursor),
      };
    }),
  );

  view.focus();
  return true;
}

function toggleLineMarker(view: EditorView, marker: string) {
  const flags = `${marker} `;

  view.dispatch(
    view.state.changeByRange((range) => {
      const line = view.state.doc.lineAt(range.from);
      if (line.text.startsWith(flags)) {
        // Remove the heading
        return {
          changes: {
            from: line.from,
            to: line.from + flags.length,
          },
          range: EditorSelection.range(
            range.from - flags.length,
            range.to - flags.length,
          ),
        };
      } else {
        const content = line.text.replace(/^(([#|>]+) )?/, flags);
        const diffLength = content.length - line.length;
        return {
          changes: {
            from: line.from,
            to: line.to,
            insert: content,
          },
          range: EditorSelection.range(
            range.anchor + diffLength,
            range.head + diffLength,
          ),
        };
      }
    }),
  );

  view.focus();
  return true;
}

export default function WriterEditorToolbar(props: WriterEditorToolbarProps) {
  function bold() {
    if (props.view) {
      toggleWrapSelection(props.view, "**");
    }
  }

  function italic() {
    if (props.view) {
      toggleWrapSelection(props.view, "*");
    }
  }

  function lineMarker(marker: string) {
    if (props.view) {
      toggleLineMarker(props.view, marker);
    }
  }

  function link(startsWith: string) {
    if (props.view) {
      toggleLink(props.view, startsWith);
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto mt-4 md:mt-8 border border-sidebar-border flex items-center rounded-md">
      <Button size="icon" variant="ghost" onClick={bold}>
        <Bold />
      </Button>
      <Button size="icon" variant="ghost" onClick={italic}>
        <Italic />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="icon" variant="ghost" onClick={() => lineMarker("#")}>
        <Heading1 />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => lineMarker("##")}>
        <Heading2 />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => lineMarker("###")}>
        <Heading3 />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => lineMarker("####")}>
        <Heading4 />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="icon" variant="ghost" onClick={() => lineMarker(">")}>
        <Quote />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="icon" variant="ghost" onClick={() => link("[")}>
        <Link />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => link("![")}>
        <ImageIcon />
      </Button>
    </div>
  );
}
