"use client";

import { SyncDataContext } from "@/components/sync-data-provider";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useContext } from "react";

export default function SyncButton() {
  const syncEngine = useContext(SyncDataContext);

  return (
    <Button
      onClick={() => syncEngine?.start()}
      disabled={syncEngine?.isSyncing}
    >
      <RefreshCw
        className={syncEngine?.isSyncing ? "animate-spin" : undefined}
      />
      Sync Now
    </Button>
  );
}
