import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { startCheckoutFlow } from "@/lib/billing/actions";
import Link from "next/link";

type ChatLimitBannerProps = {
  isLoggedIn: boolean;
};

export default function UnlockAllBanner({ isLoggedIn }: ChatLimitBannerProps) {
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
    <div className="mx-auto max-w-4xl mb-4 bg-primary/10 px-5 py-2 shadow-lg font-bold backdrop-blur-md dark:border-red-800/20 dark:bg-red-700/20 dark:text-red-200 w-full space-y-2">
      <p>Unlock all models + more.</p>
      {isLoggedIn ? (
        <Button onClick={() => checkoutMutation.mutate()}>Upgrade Now!</Button>
      ) : (
        <Button variant="default" asChild>
          <Link href={`/auth/login?returnTo=${window.location.pathname}`}>
            Log in to reset your limits. (It&apos;s free!)
          </Link>
        </Button>
      )}
    </div>
  );
}
