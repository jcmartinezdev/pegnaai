import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown, Globe } from "lucide-react";
import { LlmModel, models } from "@/lib/chat/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import ModelIcon from "@/components/model-icon";
import { isFreePlan } from "@/lib/billing/account";
import UnlockAllBanner from "./unlock-all-banner";

interface ModelPickerProps {
  isLoggedIn: boolean;
  userPlan?: string;
  selectedModel: LlmModel;
  onSelectModel: (model: LlmModel) => void;
}

export function ModelPicker({
  isLoggedIn,
  userPlan,
  selectedModel,
  onSelectModel,
}: ModelPickerProps) {
  const currentModel = models[selectedModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 min-w-40 justify-between"
        >
          <div className="flex items-center gap-2">
            <ModelIcon model={selectedModel} className="h-5 w-5" />
            <span>{currentModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {isFreePlan(userPlan) && <UnlockAllBanner isLoggedIn={isLoggedIn} />}
        {Object.entries(models).map(([key, model]) => (
          <DropdownMenuItem
            key={key}
            disabled={model.requiresPro && isFreePlan(userPlan)}
            className="flex items-start gap-2 py-2 cursor-pointer"
            onClick={() => onSelectModel(key as LlmModel)}
          >
            <div className="mt-0.5">
              <ModelIcon model={key as LlmModel} />
            </div>
            <div className="flex-grow">
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-muted-foreground">
                {model.description}
              </div>
            </div>
            <div className="flex gap-2 w-18 flex-none items-center justify-end">
              {model.allowSearch && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Globe className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2 bg-neutral-900 text-neutral-100 rounded-lg shadow-lg">
                        This model supports searching the web.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {model.allowReasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Brain className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2 bg-neutral-900 text-neutral-100 rounded-lg shadow-lg">
                        This model supports high reasoning.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
