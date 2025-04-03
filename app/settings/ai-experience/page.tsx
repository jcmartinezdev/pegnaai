import { getAIExperienceSettings } from "@/db/queries";
import AIExperienceForm from "./ai-experience-form";
import { auth0 } from "@/lib/auth0";
import { userAIExperienceTable } from "@/db/schema";

export default async function AIExperiencePage() {
  const session = await auth0.getSession();
  const aiExperience: typeof userAIExperienceTable.$inferSelect =
    (await getAIExperienceSettings(session!.user.sub)) ||
    ({
      id: session!.user.sub,
      name: session!.user.name,
      role: "",
      about: "",
      customInstructions: "",
      traits: [],
    } as typeof userAIExperienceTable.$inferSelect);
  return <AIExperienceForm aiExperience={aiExperience} />;
}
