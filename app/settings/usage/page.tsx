import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, BarChart3, Clock } from "lucide-react";
import { auth0 } from "@/lib/auth0";
import { getCurrentUserUsageForUser, getUserLimits } from "@/db/queries";

export default async function UsagePage() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usage Limits</h2>
        <p className="text-muted-foreground">
          Monitor your current usage and limits
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center">
              <div className="rounded-full p-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Current Month</CardTitle>
              </div>
            </div>
            <span className="flex items-center text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Resets in {userLimits.resetsIn} days
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Messages Used</Label>
                <p className="text-3xl font-bold">
                  {currentUsage.messagesCount}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {userLimits.messagesLimit}
                  </span>
                </p>
              </div>
              <div className="rounded-full px-3 py-1 text-sm font-medium">
                {currentMessagesPercentage}% Used
              </div>
            </div>

            <Progress
              value={currentMessagesPercentage}
              className="h-3 rounded-full"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {userLimits.messagesLimit - currentUsage.messagesCount} messages
                remaining
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Premium Messages Used</Label>
                <p className="text-3xl font-bold">
                  {currentUsage.premiumMessagesCount}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {userLimits.premiumMessagesLimit}
                  </span>
                </p>
              </div>
              <div className="rounded-full px-3 py-1 text-sm font-medium">
                {currentPremiumMessagesPercentage}% Used
              </div>
            </div>

            <Progress
              value={currentPremiumMessagesPercentage}
              className="h-3 rounded-full"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {userLimits.premiumMessagesLimit -
                  currentUsage.premiumMessagesCount}{" "}
                messages remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border">
        <HelpCircle className="h-5 w-5" />
        <AlertTitle className="font-medium">
          Usage resets on the 1st of each month
        </AlertTitle>
        <AlertDescription>
          If you need additional capacity before then, consider upgrading your
          plan or purchasing add-ons.
        </AlertDescription>
      </Alert>
    </div>
  );
}
