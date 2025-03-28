import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Download,
  Trash2,
  LogOut,
  Cloud,
  Lock,
  Smartphone,
  AlertTriangle,
  Laptop,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function SyncPage() {
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
            <Switch defaultChecked />
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-medium">Data Management</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Conversations
              </Button>
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
              <Button
                variant="destructive"
                className="w-full md:w-auto mt-4 md:mt-0"
              >
                <Trash2 />
                Delete All User Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
