"use client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Plus } from "lucide-react";
import { ThreadModel } from "@/lib/localDb";
import { useThreadRouter } from "./thread-router";

export default function AppHeader({ thread }: { thread?: ThreadModel }) {
  const { state, isMobile } = useSidebar();
  const { navigateToThread, currentApp } = useThreadRouter();

  function getNewThreadTitle() {
    switch (currentApp) {
      case "chat":
        return "New Chat";
      case "writer":
        return "New Document";
      default:
        return "New";
    }
  }

  return (
    <header className="flex py-2 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-3 w-full">
        {(state === "collapsed" || isMobile) && (
          <>
            <SidebarTrigger />
            <Button
              variant="ghost"
              className="w-7 h-7"
              onClick={() => navigateToThread("")}
            >
              <Plus />
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
          </>
        )}
        <div className="truncate">{thread?.title || getNewThreadTitle()}</div>
        <div className="flex-grow"></div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
