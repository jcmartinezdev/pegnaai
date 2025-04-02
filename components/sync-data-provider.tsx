"use client";

import { localSyncData } from "@/lib/sync/local-sync";
import { useMutation } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useEffect } from "react";

type SyncDataContextType = {
  start: () => void;
  isSyncing: boolean;
};

// Create context with appropriate typing
export const SyncDataContext = createContext<SyncDataContextType | null>(null);

export function SyncDataProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const syncDataMutation = useMutation({
    mutationKey: ["syncData"],
    mutationFn: localSyncData,
    scope: {
      id: "syncData",
    },
  });

  const startSync = useCallback(() => {
    if (!syncDataMutation.isPending) {
      syncDataMutation.mutate(userId);
    }
  }, [syncDataMutation.isPending, syncDataMutation.mutate, userId]);

  // Sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        startSync();
      },
      5 * 60 * 1000,
    );

    // startSync();

    return () => clearInterval(interval);
  }, [userId, startSync]);

  return (
    <SyncDataContext.Provider
      value={{
        start: startSync,
        isSyncing: syncDataMutation.isPending,
      }}
    >
      {children}
    </SyncDataContext.Provider>
  );
}
