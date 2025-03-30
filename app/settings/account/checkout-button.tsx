"use client";
import { startCheckoutFlow } from "@/lib/billing/actions";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CheckoutButton() {
  const openCheckoutFlow = useMutation({
    mutationFn: async () => {
      const response = await startCheckoutFlow({
        returnTo: "/settings/account",
      });

      if (response && !response.success) {
        throw new Error(
          "Failed to open the checkout portal. Please try again.",
        );
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return (
    <Button
      size="lg"
      onClick={() => openCheckoutFlow.mutate()}
      disabled={openCheckoutFlow.isPending}
      className="w-full"
    >
      Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
