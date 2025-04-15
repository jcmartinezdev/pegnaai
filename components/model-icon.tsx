import { LlmModel } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { Code, LucideProps, MessageCircle, Pen } from "lucide-react";

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
    case "writer":
      return <Pen className={cn("text-blue-500", className)} {...props} />;
    default:
      return undefined;
  }
}
