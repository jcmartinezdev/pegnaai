import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUserUsageForUser, getUserLimits } from "@/db/queries";
import { auth0 } from "@/lib/auth0";
import Link from "next/link";

export default async function UserUsageSummary() {
  const session = await auth0.getSession();
  const [currentUsage, userLimits] = await Promise.all([
    getCurrentUserUsageForUser(session!.user.sub),
    getUserLimits(session!.user.sub),
  ]);

  const currentMessagesPercentage = Math.round(
    (currentUsage.messagesCount / userLimits.messagesLimit) * 100,
  );
  const currentPremiumMessagesPercentage =
    userLimits.premiumMessagesLimit === 0
      ? 100
      : Math.round(
          (currentUsage.premiumMessagesCount /
            userLimits.premiumMessagesLimit) *
            100,
        );

  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Usage Summary</h2>
        <Link
          href="/settings/usage"
          className="text-sm text-primary hover:underline"
        >
          View Details
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Messages</span>
            <span className="font-medium">
              {currentUsage.messagesCount} / {userLimits.messagesLimit}
            </span>
          </div>
          <Progress value={currentMessagesPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentMessagesPercentage}% used</span>
            <span>
              {userLimits.messagesLimit - currentUsage.messagesCount} remaining
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Premium Models</span>
            <span className="font-medium">
              {currentUsage.premiumMessagesCount} /{" "}
              {userLimits.premiumMessagesLimit}
            </span>
          </div>
          <Progress value={currentPremiumMessagesPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentPremiumMessagesPercentage}% used</span>
            <span>
              {userLimits.premiumMessagesLimit -
                currentUsage.premiumMessagesCount}{" "}
              remaining
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
