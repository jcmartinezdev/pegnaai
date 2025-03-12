import askNextChat from "@/lib/chat";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { chatDB } from "@/lib/db";
import { useChatRouter } from "@/lib/chatRouter";

type Props = {
  threadId: string;
};

type ChatFormInputs = {
  content: string;
};

export default function ChatForm({ threadId }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ChatFormInputs>();
  const { navigateToChat } = useChatRouter();

  const onSubmit: SubmitHandler<ChatFormInputs> = async (data) => {
    const model = "gpt-4o";
    const modelParams = {};
    let saveThreadId = threadId;

    if (!saveThreadId) {
      const newThreadId = await chatDB.createThread({
        title: "New Chat",
        model,
      });

      saveThreadId = newThreadId;

      navigateToChat(newThreadId);
    }

    // Save the user message to the DB
    await chatDB.addMessage({
      threadId: saveThreadId,
      content: data.content,
      role: "user",
      status: "done",
      model,
      modelParams,
    });

    askNextChat({
      threadId: saveThreadId,
      model,
      modelParams,
      messages: await chatDB.getAllMessages(saveThreadId),
    });

    reset();
  };

  return (
    <form
      className="mx-auto max-w-4xl bg-accent rounded-t-xl border-2 border-b-0 py-2 shadow-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Textarea
        className="focus-visible:ring-0 border-0 shadow-none"
        placeholder="Ask me anything..."
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing && "Enter" === e.key && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
              form.requestSubmit();
            }
          }
        }}
        {...register("content", { required: true })}
      />
      <Button type="submit" disabled={!isValid}>
        Send
      </Button>
    </form>
  );
}
