"use client";

import { Button } from "@/components/ui/button";
import { chatDB } from "@/lib/localDb";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function ExportConversationsButton() {
  async function onExport() {
    try {
      const blob = new Blob(
        [
          JSON.stringify({
            threads: await chatDB.getAllThreads(),
            messages: await chatDB.getAllMessages(),
          }),
        ],
        {
          type: "application/json",
        },
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pegna-ai-export${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Conversations exported successfully!");
    } catch (error) {
      console.error("Error exporting conversations:", error);
      toast.error("Error exporting conversations. Please try again.");
    }
  }

  return (
    <Button variant="outline" onClick={onExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Conversations
    </Button>
  );
}
