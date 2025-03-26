import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, BarChart3, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UsagePage() {
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
          <div className="flex items-center space-x-4">
            <div className="rounded-full p-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Current Month</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="messages">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="messages" className="flex-1">
                Messages
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex-1">
                Premium Models
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                Usage History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Messages Used</Label>
                    <p className="text-3xl font-bold">
                      1,045{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / 1,500
                      </span>
                    </p>
                  </div>
                  <div className="rounded-full px-3 py-1 text-sm font-medium">
                    70% Used
                  </div>
                </div>

                <Progress value={70} className="h-3 rounded-full" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    455 messages remaining
                  </span>
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    Resets in 16 days
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Today</p>
                      <p className="text-2xl font-bold">42</p>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold">287</p>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Daily Average</p>
                      <p className="text-2xl font-bold">35</p>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Premium Model Queries</Label>
                    <p className="text-3xl font-bold">
                      87{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / 200
                      </span>
                    </p>
                  </div>
                  <div className="rounded-full px-3 py-1 text-sm font-medium">
                    43% Used
                  </div>
                </div>

                <Progress value={43} className="h-3 rounded-full" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    113 premium queries remaining
                  </span>
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    Resets in 16 days
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Today</p>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">queries</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold">32</p>
                      <p className="text-xs text-muted-foreground">queries</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Daily Average</p>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-xs text-muted-foreground">queries</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="rounded-lg border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                  <div>Month</div>
                  <div>Messages</div>
                  <div>Premium Queries</div>
                  <div>% of Limit</div>
                </div>

                <div className="grid grid-cols-4 gap-4 border-t p-4">
                  <div>April 2024</div>
                  <div>1,342</div>
                  <div>178</div>
                  <div>89%</div>
                </div>

                <div className="grid grid-cols-4 gap-4 border-t p-4">
                  <div>March 2024</div>
                  <div>1,156</div>
                  <div>143</div>
                  <div>77%</div>
                </div>

                <div className="grid grid-cols-4 gap-4 border-t p-4">
                  <div>February 2024</div>
                  <div>987</div>
                  <div>112</div>
                  <div>66%</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert className="border">
        <HelpCircle className="h-5 w-5" />
        <AlertTitle className="font-medium">
          Usage resets on the 1st of each month
        </AlertTitle>
        <AlertDescription>
          Your next reset will be on June 1, 2024. If you need additional
          capacity before then, consider upgrading your plan or purchasing
          add-ons.
        </AlertDescription>
      </Alert>
    </div>
  );
}
