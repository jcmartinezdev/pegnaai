"only server";

import {
  getCurrentUserUsageForUser,
  getUser,
  getUserLimits,
  incrementUserUsageForUser,
} from "@/db/queries";
import { auth0 } from "../auth0";
import { cookies } from "next/headers";
import { ModelParams, ModelType } from "../ai/types";
import { isFreePlan } from "./account";

const RATE_LIMIT_COOKIE = "pegna_rl";

export async function validateRateLimits(
  currentModel: ModelType,
  modelParams: ModelParams,
): Promise<{
  remainingMessages: number;
  remainingPremiumMessages: number;
}> {
  const session = await auth0.getSession();
  const [user, limits, usage] = await Promise.all([
    await getUser(session?.user.sub || "unknown"),
    await getUserLimits(session?.user.sub),
    await getCurrentUserUsageForUser(session?.user.sub || "unknown"),
  ]);

  // Validate if the user has access to the model
  // And to advanced features such as search, or high reasoning
  let hasAccess = false;
  if (
    currentModel.requiresPro ||
    modelParams?.includeSearch ||
    modelParams?.reasoningEffort === "high"
  ) {
    if (session) {
      if (!isFreePlan(user?.planName)) {
        hasAccess = true;
      }
    }
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    throw new Error("You need a pro account to access this model.");
  }

  if (session) {
    // Check for rate limits
    if (currentModel.isPremium) {
      if (usage.premiumMessagesCount >= limits.premiumMessagesLimit) {
        throw new Error("You have reached your premium message limit.");
      }
    } else {
      if (usage.messagesCount >= limits.messagesLimit) {
        throw new Error("You have reached your message limit.");
      }
    }

    await incrementUserUsageForUser(session.user.sub, currentModel.isPremium);

    return {
      remainingMessages:
        limits.messagesLimit -
        usage.messagesCount -
        (currentModel.isPremium ? 0 : 1),
      remainingPremiumMessages:
        limits.premiumMessagesLimit -
        usage.premiumMessagesCount -
        (currentModel.isPremium ? 1 : 0),
    };
  } else {
    const cookieStore = await cookies();
    let remainingMessages: number = 9;
    if (cookieStore.has(RATE_LIMIT_COOKIE)) {
      remainingMessages = Number(
        cookieStore.get(RATE_LIMIT_COOKIE)?.value || 0,
      );

      if (remainingMessages <= 0) {
        throw new Error("You have reached your message limit.");
      }
      remainingMessages--;
    }

    // Save the new value
    cookieStore.set(RATE_LIMIT_COOKIE, String(remainingMessages));

    return {
      remainingMessages: remainingMessages,
      remainingPremiumMessages: 0,
    };
  }
}
