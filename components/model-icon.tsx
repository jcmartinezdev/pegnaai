import { LlmModel } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { Code, LucideProps, MessageCircle } from "lucide-react";

type ModelIconProps = LucideProps & {
  model: LlmModel;
};

export default function ModelIcon({
  model,
  className,
  ...props
}: ModelIconProps) {
  switch (model) {
    case "chat":
      return (
        <MessageCircle
          className={cn("text-yellow-500", className)}
          {...props}
        />
      );
    case "code":
      return <Code className={cn("text-pink-500", className)} {...props} />;
    default:
      return undefined;
  }
}
