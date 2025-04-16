"use client";

import { PegnaAppType } from "@/lib/ai/types";
import { redirect } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThreadRouterContextType {
  currentApp: PegnaAppType | undefined;
  threadId: string;
  navigateToThread: (threadId: string, app?: PegnaAppType) => void;
}

const ThreadRouterContext = createContext<ThreadRouterContextType | undefined>(
  undefined,
);

interface ThreadRouterProviderProps {
  children: ReactNode;
}

export const ThreadRouterProvider = ({
  children,
}: ThreadRouterProviderProps) => {
  const [currentApp, setCurrentApp] = useState<PegnaAppType | undefined>();
  const [threadId, setThreadId] = useState<string>("");

  const valuesFromPath = useCallback(
    (
      pathname: string,
    ): {
      app: PegnaAppType | undefined;
      threadId: string;
    } => {
      const parts = pathname.split("/");
      if (parts.length > 2 && (parts[1] === "chat" || parts[1] === "writer")) {
        return {
          app: parts[1] as PegnaAppType,
          threadId: parts[2],
        };
      }
      if (
        parts.length === 2 &&
        (parts[1] === "chat" || parts[1] === "writer")
      ) {
        return {
          app: parts[1] as PegnaAppType,
          threadId: "",
        };
      }
      return {
        app: undefined,
        threadId: "",
      };
    },
    [],
  );

  const navigateToThread = useCallback(
    (newThreadId: string, app?: PegnaAppType) => {
      if (app && app !== currentApp) {
        redirect(`/${app}/${newThreadId}`);
      } else {
        if (newThreadId !== threadId && currentApp) {
          setThreadId(newThreadId);
          window.history.pushState(
            {},
            "",
            `/${app ? app : currentApp}/${newThreadId}`,
          );
        }
      }
    },
    [threadId, currentApp],
  );

  useEffect(() => {
    const handleLocationChange = () => {
      const values = valuesFromPath(window.location.pathname);
      setThreadId(values.threadId);
      setCurrentApp(values.app);
    };

    handleLocationChange();

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [valuesFromPath]);

  return (
    <ThreadRouterContext.Provider
      value={{ currentApp, threadId, navigateToThread }}
    >
      {children}
    </ThreadRouterContext.Provider>
  );
};

export const useThreadRouter = (): ThreadRouterContextType => {
  const context = useContext(ThreadRouterContext);
  if (!context) {
    throw new Error(
      "useThreadRouter must be used within a ThreadRouterProvider",
    );
  }
  return context;
};
