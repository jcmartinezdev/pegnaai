"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Sparkles, Gauge, ChevronDown, Globe } from "lucide-react";
import { LlmModel, models } from "@/lib/db";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface ModelPickerProps {
  selectedModel: LlmModel;
  onSelectModel: (model: LlmModel) => void;
}

export function ModelPicker({
  selectedModel,
  onSelectModel,
}: ModelPickerProps) {
  const getIcon = (type: LlmModel) => {
    switch (type) {
      case "fast":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "balanced":
        return <Gauge className="h-5 w-5 text-blue-500" />;
      case "powerful":
        return <Brain className="h-5 w-5 text-purple-500" />;
      case "code":
        return <Sparkles className="h-5 w-5 text-pink-500" />;
      default:
        return null;
    }
  };

  const currentModel = models[selectedModel];
  const currentIcon = getIcon(selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 min-w-40 justify-between"
        >
          <div className="flex items-center gap-2">
            {currentIcon}
            <span>{currentModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {Object.entries(models).map(([key, model]) => (
          <DropdownMenuItem
            key={key}
            className="flex items-start gap-2 py-2 cursor-pointer"
            onClick={() => onSelectModel(key as LlmModel)}
          >
            <div className="mt-0.5">{getIcon(key as LlmModel)}</div>
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
