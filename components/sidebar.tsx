"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDB } from "@/lib/db";
import { useEffect } from "react";

export default function Sidebar() {
  const threads = useLiveQuery(() => {
    return chatDB.getAllThreads();
  });

  useEffect(() => {
    console.log("Checking...", threads);
    if (threads && threads.length === 0) {
      chatDB.createrOnboardingThreads();
    }
  }, [threads]);

  return (
    <nav className="hidden md:relative md:flex md:w-72 bg-sidebar text-sidebar-foreground border-sidebar-border border-r-2">
      <div className="flex h-full flex-col w-full">
        <div className="flex shirnk-0 items-center p-4">
          <h1>Next Chat</h1>
        </div>
        <div className="mt-2 flex-1 overflow-y-auto">
          <ul role="list" className="flex flex-col">
            {threads?.map((thread) => (
              <li key={thread.id} data-thread-id={thread.id}>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="w-6 h-6" />
                  Chat title
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex w-full items-center justify-center gap-3 p-4">
            Juan
          </div>
        </div>
      </div>
    </nav>
  );
}
