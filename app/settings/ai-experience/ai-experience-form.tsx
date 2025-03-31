"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Sparkles, Brain, Save } from "lucide-react";
import { userAIExperienceTable } from "@/db/schema";
import { useForm } from "react-hook-form";
import { traits } from "@/lib/chat/types";
import { useMutation } from "@tanstack/react-query";
import { saveAIExperienceSettings } from "./actions";
import { toast } from "sonner";

type AIExperienceFormProps = {
  aiExperience: typeof userAIExperienceTable.$inferSelect;
};

export default function AIExperienceForm({
  aiExperience,
}: AIExperienceFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<
    typeof userAIExperienceTable.$inferInsert
  >({
    defaultValues: aiExperience,
  });

  const aiExperienceMutation = useMutation({
    mutationFn: (data: typeof userAIExperienceTable.$inferInsert) =>
      saveAIExperienceSettings(data),
    onSuccess: () => {
      toast.success("AI Experience settings saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving AI Experience settings:", error);
      toast.error("Failed to save AI Experience settings.");
    },
  });

  const currentTraits = watch("traits");

  function handleTraitChange(trait: string, checked: boolean) {
    const updatedTraits = checked
      ? [...(currentTraits || []), trait]
      : currentTraits?.filter((t: string) => t !== trait) || [];

    setValue("traits", updatedTraits);
  }

  function onSubmit(data: typeof userAIExperienceTable.$inferInsert) {
    aiExperienceMutation.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                      placeholder="Your preferred name"
                      {...register("name")}
                      className="max-w-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      This is how the AI will address you in conversations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-base">
                      What do you do?
                    </Label>
                    <Input
                      placeholder="Your profession or role, e.g. Software Engineer, student"
                      {...register("role")}
                      className="max-w-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      We can use this information to tailor responses to your
                      profession
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-base">
                      More about you
                    </Label>
                    <Textarea
                      placeholder="Interests, hobbies, values, or anything else you'd like to share."
                      {...register("about")}
                      className="max-w-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      This information helps the AI understand your context and
                      preferences better
                    </p>
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
                      {traits.map((trait) => (
                        <div
                          key={trait.value}
                          className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:border-primary"
                        >
                          <Checkbox
                            id={trait.value}
                            checked={
                              currentTraits &&
                              currentTraits.includes(trait.value)
                            }
                            onCheckedChange={(checked) =>
                              handleTraitChange(trait.value, checked as boolean)
                            }
                            value={trait.value}
                          />
                          <div>
                            <label
                              htmlFor={trait.value}
                              className="font-medium"
                            >
                              {trait.label}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {trait.description}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      placeholder="Add any specific instructions for how the AI should respond to you"
                      {...register("customInstructions")}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: &quot;Always provide code examples when
                      explaining technical concepts&quot; or &quot;Keep
                      explanations simple and avoid jargon&quot;
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={aiExperienceMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
