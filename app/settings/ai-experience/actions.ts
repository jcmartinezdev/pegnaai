"use server";

import * as dbQueries from "@/db/queries";
import { userAIExperienceTable } from "@/db/schema";

export async function saveAIExperienceSettings(
  aiExperience: typeof userAIExperienceTable.$inferInsert,
) {
  return dbQueries.saveAIExperienceSettings(aiExperience);
}
