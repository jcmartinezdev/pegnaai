"use client";

import { User } from "@auth0/nextjs-auth0/types";
import { Bug, Rocket } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";
import { toast } from "sonner";

type FeedbackButtonsProps = {
  user: User;
  userHash: string;
  planName: string;
};

export default function FeedbackButtons({
  user,
  userHash,
  planName,
}: FeedbackButtonsProps) {
  useEffect(() => {
    /*eslint-disable-next-line @typescript-eslint/no-explicit-any*/
    const win = window as any;
    if (typeof win.Featurebase !== "function") {
      /*eslint-disable-next-line @typescript-eslint/no-explicit-any*/
      win.Featurebase = function (...args: any[]) {
        (win.Featurebase.q = win.Featurebase.q || []).push(args);
      };
    }

    console.log({
      id: user.sub.replace(/\|/g, "."),
      userHash,
    });

    win.Featurebase(
      "identify",
      {
        // Each 'identify' call should include an "organization"
        // property, which is your Featurebase board's name before the
        // ".featurebase.app".
        organization: "pegnaai",
        // Required fields. Replace with your customers data.
        email: user.email,
        name: user.name,
        id: user.sub.replace(/\|/g, "."),
        userHash,
        // Both email and userId should be provided when possible
        // At minimum, either email or userId must be present

        // Optional - add a profile picture to the user
        profilePicture: user.picture,
        // Optional - include other fields as needed
        customFields: {
          plan: planName,
        },
      },
      (err: Error) => {
        // Callback function. Called when identify completed.
        if (err) {
          console.error("Error identifying user:", err);
          toast.error("There was an unexpected error loading the support page");
        }
      },
    );
  }, [user.name, user.sub, user.email, user.picture, userHash, planName]);

  return (
    <>
      <Script src="https://do.featurebase.app/js/sdk.js" id="featurebase-sdk" />
      <Link
        target="_blank"
        href="https://feedback.pegna.ai"
        className="flex items-center rounded-lg border p-4 gap-x-4"
        rel="noopener noreferrer"
      >
        <Rocket className="h-6 w-6" />
        <div>
          <h4 className="font-medium">Feature Requests</h4>
          <p className="text-sm text-muted-foreground">
            Got a cool idea? Share it with us! Vote on the features you want to
            see and help us prioritize what&apos;s next.
          </p>
        </div>
      </Link>
      <Link
        target="_blank"
        href="https://feedback.pegna.ai/?b=67f3a78623cbb9714b119a12"
        className="flex items-center rounded-lg border p-4 gap-x-4"
        rel="noopener noreferrer"
      >
        <Bug className="h-6 w-6" />
        <div>
          <h4 className="font-medium">Found a Bug?</h4>
          <p className="text-sm text-muted-foreground">
            Something not working as expected? Report the bug here and
            we&apos;ll get right on it! We appreciate your help in making the
            app better.
          </p>
        </div>
      </Link>
    </>
  );
}
