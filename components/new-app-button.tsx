import { useState } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { PegnaAppType } from "@/lib/ai/types";
import { useThreadRouter } from "./thread-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";

export default function NewAppButton() {
  const { currentApp, navigateToThread } = useThreadRouter();
  const [open, setOpen] = useState(false);
  const { setOpenMobile } = useSidebar();

  function getNewButtonText() {
    switch (currentApp) {
      case "chat":
        return "New Chat";
      case "writer":
        return "New Document";
      default:
        return "New";
    }
  }

  function onNewApp(app?: PegnaAppType) {
    navigateToThread("", app);
    setOpenMobile(false);
  }

  return (
    <div className="flex w-full">
      <Button
        onClick={() => onNewApp()}
        className="flex-grow rounded-r-none border-r border-r-primary-foreground/20 flex-1"
      >
        {getNewButtonText()}
        <Plus />
      </Button>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="rounded-l-none px-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Open options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onNewApp("chat")}>
            New Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNewApp("writer")}>
            New Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
