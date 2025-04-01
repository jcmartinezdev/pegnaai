"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { LAST_SYNC_DATE_STORAGE_KEY, localSyncData } from "./localSync";

export default function useSync(userId?: string) {
  const syncMutation = useMutation({
    mutationFn: localSyncData,
    scope: {
      id: "syncData",
    },
  });

  const startSync = useCallback(() => {
    if (!syncMutation.isPending) {
      syncMutation.mutate();
    }
  }, [syncMutation]);

  // Sync every 5 minutes
  useEffect(() => {
    if (!userId) {
      // If the user logged out make sure to clear the last sync date
      if (localStorage.getItem(LAST_SYNC_DATE_STORAGE_KEY)) {
        localStorage.removeItem(LAST_SYNC_DATE_STORAGE_KEY);
      }
    }
    const interval = setInterval(() => {}, 5 * 60 * 1000);

    startSync();

    return () => clearInterval(interval);
  }, [userId, startSync]);

  return {
    startSync,
    isSyncing: syncMutation.isPending,
  };
}
