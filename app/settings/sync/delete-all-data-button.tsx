"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAllServerData } from "./actions";
import { chatDB } from "@/lib/localDb";
import { useContext } from "react";
import { SyncDataContext } from "@/components/sync-data-provider";

export default function DeleteAllDataButton() {
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

  return (
    <Button
      variant="destructive"
      className="w-full md:w-auto mt-4 md:mt-0"
      onClick={() => deleteDataMutation.mutate()}
      disabled={deleteDataMutation.isPending || syncEngine?.isSyncing}
    >
      <Trash2 />
      Delete All User Data
    </Button>
  );
}
