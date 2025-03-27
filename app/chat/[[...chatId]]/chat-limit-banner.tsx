import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { startCheckoutFlow } from "@/lib/billing/actions";

type ChatLimitBannerProps = {
  message: string;
};

export default function ChatLimitBanner({ message }: ChatLimitBannerProps) {
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await startCheckoutFlow({
        returnTo: window.location.pathname,
      });

      if (response && !response.success) {
        throw new Error("Failed to create checkout session");
      }
    },
    onError: (err) => {
      console.log(err);
      toast.error("Failed to create checkout session");
    },
  });

  return (
    <div className="mx-auto max-w-4xl my-4 rounded-xl border border-red-400/20 bg-red-300/10 px-5 py-3 text-red-800 shadow-lg backdrop-blur-md dark:border-red-800/20 dark:bg-red-700/20 dark:text-red-200 w-full">
      {message}
      &nbsp;
      <Button
        variant="link"
        className="p-0"
        onClick={() => checkoutMutation.mutate()}
      >
        Subscribe to continue chatting.
      </Button>
    </div>
  );
}
