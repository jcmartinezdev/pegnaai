import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ChatRouterContextType {
  threadId: string;
  navigateToChat: (threadId: string) => void;
}

const ChatRouterContext = createContext<ChatRouterContextType | undefined>(
  undefined,
);

interface ChatRouterProviderProps {
  children: ReactNode;
}

export const ChatRouterProvider = ({ children }: ChatRouterProviderProps) => {
  const [threadId, setThreadId] = useState<string>("");

  const threadIdFromPath = useCallback((pathname: string) => {
    const parts = pathname.split("/");
    if (parts.length > 2 && parts[1] === "chat") {
      return parts[2];
    }
    if (parts.length === 2 && parts[1] === "chat") {
      return "";
    }
    return "";
  }, []);

  const navigateToChat = useCallback(
    (newThreadId: string) => {
      if (newThreadId !== threadId) {
        setThreadId(newThreadId);
        window.history.pushState({}, "", `/chat/${newThreadId}`);
      }
    },
    [threadId],
  );

  useEffect(() => {
    const handleLocationChange = () => {
      const newThreadId = threadIdFromPath(window.location.pathname);
      setThreadId(newThreadId);
    };

    handleLocationChange();

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [threadIdFromPath]);

  return (
    <ChatRouterContext.Provider value={{ threadId, navigateToChat }}>
      {children}
    </ChatRouterContext.Provider>
  );
};

export const useChatRouter = (): ChatRouterContextType => {
  const context = useContext(ChatRouterContext);
  if (!context) {
    throw new Error("useChatRouter must be used within a ChatRouterProvider");
  }
  return context;
};
