import { MessageModel } from "@/lib/localDb";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatSuggestions from "./chat-suggestions";
import { cn } from "@/lib/utils";
import ChatContent from "./chat-content";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function ChatScrollContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowScrollButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setShowScrollButton(
        Math.abs(scrollHeight - scrollTop - clientHeight) > 10,
      );
    }
  }, [messagesContainerRef]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.addEventListener("scroll", handleScroll);
      return () => {
        messagesContainerRef.current?.removeEventListener(
          "scroll",
          handleScroll,
        );
      };
    }
  }, [messagesContainerRef]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={messagesContainerRef} className="overflow-y-auto pb-48">
      <div
        role="log"
        aria-label="Chat messages"
        className="mx-auto max-w-4xl p-4 flex flex-col gap-4"
      >
        {children}
      </div>
      {showScrollButton && (
        <div className="absolute bottom-32 w-full px-4 flex items-center justify-center">
          <Button onClick={scrollToBottom} className="bg-primary/80" size="sm">
            Scroll to bottom
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
