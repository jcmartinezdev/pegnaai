import { LlmModel } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { Brain, Gauge, LucideProps, Sparkles, Zap } from "lucide-react";

type ModelIconProps = LucideProps & {
  model: LlmModel;
};

export default function ModelIcon({
  model,
  className,
  ...props
}: ModelIconProps) {
  switch (model) {
    case "fast":
      return <Zap className={cn("text-yellow-500", className)} {...props} />;
    case "balanced":
      return <Gauge className={cn("text-blue-500", className)} {...props} />;
    case "powerful":
      return <Brain className={cn("text-purple-500", className)} {...props} />;
    case "code":
      return <Sparkles className={cn("text-pink-500", className)} {...props} />;
    default:
      return undefined;
  }
}
