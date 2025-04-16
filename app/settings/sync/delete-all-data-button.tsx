"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAllServerData } from "./actions";
import { chatDB } from "@/lib/localDb";
import { useContext, useState } from "react";
import { SyncDataContext } from "@/components/sync-data-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAllDataButton() {
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const syncEngine = useContext(SyncDataContext);

  const deleteDataMutation = useMutation({
    mutationFn: async () => {
      const response = await deleteAllServerData();
      if (!response.success) {
        throw new Error("Failed to delete user data on the server");
      }

      // Delete all local data
      await chatDB.clearAllData();
    },
    onSuccess: () => {
      toast.success("All user data deleted successfully!");
    },
    onError: () => {
      toast.error("Error deleting data. Please try again later.");
    },
  });

  function onConfirm() {
    setShowDeleteAllDialog(false);
    deleteDataMutation.mutate();
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-full md:w-auto mt-4 md:mt-0"
        onClick={() => setShowDeleteAllDialog(true)}
        disabled={deleteDataMutation.isPending || syncEngine?.isSyncing}
      >
        <Trash2 />
        Delete All User Data
      </Button>
      <AlertDialog open={showDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you really want to delete all your user data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your user data from the server
              and your browser, including all chats, images, and documents. It
              won&apos;t delete your account or settings. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAllDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
