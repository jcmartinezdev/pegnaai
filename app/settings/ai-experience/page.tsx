import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Sparkles, Brain, MessageSquare, Save } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AIExperiencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Experience</h2>
        <p className="text-muted-foreground">
          Customize how the AI interacts with you
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Personalize Your AI</CardTitle>
              <CardDescription>
                Tailor the AI to match your preferences and needs
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="preferences" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="preferences" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex-1">
                <Brain className="mr-2 h-4 w-4" />
                Personality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name" className="text-base">
                    What should we call you?
                  </Label>
                  <Input
                    id="user-name"
                    placeholder="Your preferred name"
                    className="max-w-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is how the AI will address you in conversations
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base">Interface Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="code-blocks">
                          Syntax highlighting in code blocks
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Display code with syntax highlighting
                        </p>
                      </div>
                      <Switch id="code-blocks" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-scroll">
                          Auto-scroll to new messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically scroll to new messages as they arrive
                        </p>
                      </div>
                      <Switch id="auto-scroll" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compact-view">Compact view</Label>
                        <p className="text-sm text-muted-foreground">
                          Display more content with less spacing
                        </p>
                      </div>
                      <Switch id="compact-view" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personality" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">AI Personality Traits</Label>
                  <p className="text-sm text-muted-foreground">
                    Select traits that define how the AI communicates with you
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:border-primary">
                      <Checkbox id="friendly" />
                      <div>
                        <label htmlFor="friendly" className="font-medium">
                          Friendly
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Warm and approachable
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox id="professional" defaultChecked />
                      <div>
                        <label htmlFor="professional" className="font-medium">
                          Professional
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Formal and business-like
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:border-primary">
                      <Checkbox id="creative" />
                      <div>
                        <label htmlFor="creative" className="font-medium">
                          Creative
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Imaginative and original
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox id="concise" defaultChecked />
                      <div>
                        <label htmlFor="concise" className="font-medium">
                          Concise
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Brief and to the point
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:border-primary">
                      <Checkbox id="humorous" />
                      <div>
                        <label htmlFor="humorous" className="font-medium">
                          Humorous
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Witty and entertaining
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox id="analytical" defaultChecked />
                      <div>
                        <label htmlFor="analytical" className="font-medium">
                          Analytical
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Logical and detailed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="custom-instructions" className="text-base">
                    Custom Instructions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add specific instructions for how the AI should respond to
                    you
                  </p>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Add any specific instructions for how the AI should respond to you"
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "Always provide code examples when explaining
                    technical concepts" or "Keep explanations simple and avoid
                    jargon"
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base">Communication Style</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <RadioGroup defaultValue="balanced">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="balanced" id="balanced" />
                          <Label htmlFor="balanced" className="font-medium">
                            Balanced
                          </Label>
                        </div>
                        <p className="mt-1 pl-6 text-sm text-muted-foreground">
                          Mix of conciseness and detail
                        </p>
                      </RadioGroup>
                    </div>

                    <div className="rounded-lg border p-4">
                      <RadioGroup defaultValue="balanced">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="detailed" id="detailed" />
                          <Label htmlFor="detailed" className="font-medium">
                            Detailed
                          </Label>
                        </div>
                        <p className="mt-1 pl-6 text-sm text-muted-foreground">
                          Comprehensive and thorough
                        </p>
                      </RadioGroup>
                    </div>

                    <div className="rounded-lg border p-4">
                      <RadioGroup defaultValue="balanced">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="brief" id="brief" />
                          <Label htmlFor="brief" className="font-medium">
                            Brief
                          </Label>
                        </div>
                        <p className="mt-1 pl-6 text-sm text-muted-foreground">
                          Short and direct responses
                        </p>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
