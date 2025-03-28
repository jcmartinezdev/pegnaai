import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Award, Check, CreditCard, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CustomerPortalButton from "./customer-portal-button";
import { getProLimits, getUser } from "@/db/queries";
import { auth0 } from "@/lib/auth0";
import { getPlanName, isFreePlan } from "@/lib/billing/account";
import CheckoutButton from "./checkout-button";

export default async function SubscriptionPage() {
  const session = await auth0.getSession();
  const user = await getUser(session!.user.sub);
  const proLimits = getProLimits();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{getPlanName(user?.planName)} Plan</CardTitle>
                <CardDescription>
                  {isFreePlan(user?.planName)
                    ? "You're currently on the free plan"
                    : "Your subscription renews on June 15, 2024"}
                </CardDescription>
              </div>
            </div>
            {!isFreePlan(user?.planName) && <CustomerPortalButton />}
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="mb-6" />
          <div>
            {isFreePlan(user?.planName) ? (
              <h4 className="mb-4 text-base font-medium">Upgrade to Pro</h4>
            ) : (
              <h4 className="mb-4 text-base font-medium">Plan Features</h4>
            )}
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Access to all available AI models</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>{proLimits.messagesLimit} messages per month</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>
                  {proLimits.premiumMessagesLimit} premium model messages per
                  month
                </span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Advanced customization options</span>
              </li>
            </ul>
          </div>

          {/*TODO: Implement this when required
          <div className="mt-6 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5" />
              <div>
                <h5 className="font-medium">Need more premium credits?</h5>
                <p className="text-sm text-muted-foreground">
                  You can purchase additional premium model queries as needed.
                </p>
                <Button variant="link" className="h-auto p-0">
                  Purchase Credits
                </Button>
              </div>
            </div>
          </div>
          */}
        </CardContent>
      </Card>

      {isFreePlan(user?.planName) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent>
            <div className="flex items-center justify-between flex-col md:flex-row">
              <div className="flex items-center gap-x-4">
                <Award className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-xl font-medium flex items-center">
                    Ready to unlock the full potential?
                  </h3>
                  <p className="text-muted-foreground">
                    Join thousands of users who have upgraded to our Pro plan.
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 w-full md:w-auto">
                <CheckoutButton />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              The following actions are irreversible and will permanently delete
              your account.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border border-destructive p-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-x-4">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="destructive"
                className="mt-4 md:mt-0 w-full md:w-auto"
              >
                <Trash2 />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
