"use client";
import { openCustomerPortal } from "@/lib/billing/actions";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function CustomerPortalButton() {
  const openCustomerPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await openCustomerPortal();

      if (response && !response.success) {
        throw new Error(
          "Failed to open the customer portal. Please try again.",
        );
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return (
    <Button
      onClick={() => openCustomerPortalMutation.mutate()}
      disabled={openCustomerPortalMutation.isPending}
    >
      Manage Subscription
    </Button>
  );
}
