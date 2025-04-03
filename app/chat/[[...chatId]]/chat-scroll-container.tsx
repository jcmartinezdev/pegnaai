import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

type ChatScrollContainerProps = {
  children: React.ReactNode;
  messagesCount: number;
};

export default function ChatScrollContainer({
  children,
  messagesCount,
}: ChatScrollContainerProps & {
  children: React.ReactNode;
  messagesCount: number;
}) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowScrollButton(false);
  }, []);

  // Scroll to the bottom when the component mounts or when messagesCount changes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [messagesContainerRef, messagesCount]);

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
      const elRef = messagesContainerRef.current;
      elRef.addEventListener("scroll", handleScroll);
      return () => {
        elRef.removeEventListener("scroll", handleScroll);
      };
    }
  }, [messagesContainerRef, handleScroll]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messagesContainerRef]);

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
