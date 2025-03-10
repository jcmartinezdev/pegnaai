import { Textarea } from "./ui/textarea";

export default function ChatForm() {
  return (
    <form className="mx-auto max-w-4xl bg-accent rounded-t-xl border-2 border-b-0 py-2 shadow-lg">
      <Textarea
        className="focus-visible:ring-0 border-0 shadow-none"
        placeholder="Ask me anything..."
      />
    </form>
  );
}
