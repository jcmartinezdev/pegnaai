import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Cloud, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SyncButton from "./sync-button";
import { auth0 } from "@/lib/auth0";
import { getUser } from "@/db/queries";
import SyncSwitch from "./sync-switch";
import ExportConversationsButton from "./export-conversations-button";
import DeleteAllDataButton from "./delete-all-data-button";

export default async function SyncPage() {
  const session = await auth0.getSession();
  const user = await getUser(session!.user.sub);
  const enableCloudSync = user ? user.enableSync : true; // Default to true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Sync &amp; History
        </h2>
        <p className="text-muted-foreground">
          Manage your account preferences and data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="mr-2 h-5 w-5" />
            Data Synchronization
          </CardTitle>
          <CardDescription>
            Control how your data is stored and synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Cloud Sync</Label>
              <p className="text-sm text-muted-foreground">
                Sync your conversations across devices
              </p>
            </div>
            <SyncSwitch defaultChecked={enableCloudSync} />
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium">Data Management</h3>
            <div className="flex flex-wrap gap-4">
              {enableCloudSync && <SyncButton />}
              <ExportConversationsButton />
            </div>
          </div>
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
              your data.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border border-destructive p-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-x-4">
              <div>
                <h4 className="font-medium text-destructive">Delete Chats</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all chats, documents, and other user data
                  from both, your local device and our servers. This will not
                  delete your account, nor your subscription and settings.
                </p>
              </div>
              <DeleteAllDataButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
