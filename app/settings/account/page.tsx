import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Check, CreditCard, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SubscriptionPage() {
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
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>
                  Your subscription renews on June 15, 2024
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                $19
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </p>
            </div>
            <Button>Manage Subscription</Button>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="mb-4 text-base font-medium">Plan Features</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>1,500 messages per month</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>200 premium model queries per month</span>
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
            <div className="flex items-center justify-between space-x-4">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
