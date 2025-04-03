"use client";

import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import saveSyncSettings from "./actions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useContext, useState } from "react";
import { SyncDataContext } from "@/components/sync-data-provider";

export default function SyncSwitch({
  defaultChecked,
}: {
  defaultChecked: boolean;
}) {
  const [showClearSyncDialog, setShowClearSyncDialog] = useState(false);
  const [enableSync, setEnableSync] = useState(defaultChecked);
  const syncEngine = useContext(SyncDataContext);

  const syncMutation = useMutation({
    mutationFn: async (enableSync: boolean) => {
      saveSyncSettings({ enableSync });

      if (enableSync) {
        // The user just enabled sync, so we can start syncing from the start
        syncEngine?.start(true);
      }
    },
  });

  function onCheckedChange(checked: boolean) {
    if (checked) {
      setEnableSync(true);
      syncMutation.mutate(true);
    } else {
      setEnableSync(true);
      setShowClearSyncDialog(true);
    }
  }

  function onConfirm() {
    setEnableSync(false);
    setShowClearSyncDialog(false);
    syncMutation.mutate(false);
  }

  return (
    <>
      <Switch
        checked={enableSync}
        onCheckedChange={onCheckedChange}
        disabled={syncMutation.isPending || syncEngine?.isSyncing}
      />
      <AlertDialog open={showClearSyncDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you really want to disable cloud sync?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your synced data from the cloud.
              Only the local copy will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearSyncDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
