import {
  ViewPlugin,
  DecorationSet,
  Decoration,
  EditorView,
  WidgetType,
  ViewUpdate,
} from "@codemirror/view";
import { Range } from "@codemirror/state";

const defaultRegexp = /!\[\s*([^\]]*)\s*\]\(\s*([^\)]*)\s*\)/gi;

export interface HyperLinkState {
  at: number;
  alt: string;
  src: string;
}

class HyperLinkIcon extends WidgetType {
  private readonly state: HyperLinkState;
  constructor(state: HyperLinkState) {
    super();
    this.state = state;
  }
  eq(other: HyperLinkIcon) {
    return (
      this.state.src === other.state.src && this.state.at === other.state.at
    );
  }
  toDOM() {
    const wrapper = document.createElement("img");
    wrapper.src = this.state.src;
    wrapper.alt = this.state.alt;
    wrapper.className = "rounded-xl border-8 mt-2 mb-2 border-secondary";
    return wrapper;
  }
}

function imageDecorations(view: EditorView) {
  const widgets: Array<Range<Decoration>> = [];

  const doc = view.state.doc.toString();
  let match;

  while ((match = defaultRegexp.exec(doc))) {
    const start = match.index;
    const end = start + match[0].length;
    const widget = Decoration.widget({
      widget: new HyperLinkIcon({
        at: end,
        alt: match[1].trim(),
        src: match[2].trim(),
      }),
      side: 1,
    });

    widgets.push(widget.range(end));
  }

  return Decoration.set(widgets, true);
}

export default function imageExtension() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = imageDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = imageDecorations(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );
}
