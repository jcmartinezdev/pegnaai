"only server";

import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from ".";
import {
  messagesTable,
  threadsTable,
  userAIExperienceTable,
  usersTable,
  userUsagesTable,
} from "./schema";
import { isFreePlan } from "@/lib/billing/account";

/**
 * Get a user by their ID
 *
 * @param id - The user ID
 *
 * @returns The user with the given ID
 */
export async function getUser(
  id: string,
): Promise<typeof usersTable.$inferSelect | undefined> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return users[0];
}

/**
 * Get a user by their Stripe customer ID
 *
 * @param stripeCustomerId - The Stripe customer ID
 *
 * @returns The user with the given Stripe customer ID
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return users[0];
}

/**
 * Create a new user
 *
 * @param user - The user data to create
 *
 * @returns The created user
 */
export async function createUser(user: typeof usersTable.$inferInsert) {
  return db.insert(usersTable).values(user);
}

/**
 * Update a user by their ID
 *
 * @param id - The user ID
 * @param user - The user data to update
 *
 * @returns The updated user
 */
export async function updateUser(
  id: string,
  user: Omit<typeof usersTable.$inferInsert, "id">,
) {
  return db.update(usersTable).set(user).where(eq(usersTable.id, id));
}

/**
 * Get the usage for a user for a specific period
 *
 * @param userId - The user ID
 * @param year - The year
 * @param month - The month
 *
 * @returns The usage for the user for the period
 */
export async function getUserUsageForPeriod(
  userId: string,
  year: number,
  month: number,
): Promise<typeof userUsagesTable.$inferSelect> {
  const usages = await db
    .select()
    .from(userUsagesTable)
    .where(
      and(
        eq(userUsagesTable.userId, userId),
        eq(userUsagesTable.year, year),
        eq(userUsagesTable.month, month),
      ),
    );

  if (usages.length === 0) {
    return {
      userId,
      year,
      month,
      messagesCount: 0,
      premiumMessagesCount: 0,
    };
  }

  return usages[0];
}

/**
 * Get the usage for a user for the current period
 *
 * @param userId - The user ID
 *
 * @returns The usage for the user for the current period
 */
export async function getCurrentUserUsageForUser(
  userId: string,
): Promise<typeof userUsagesTable.$inferSelect> {
  return getUserUsageForPeriod(
    userId,
    new Date().getFullYear(),
    new Date().getMonth(),
  );
}

export async function incrementUserUsageForUser(
  userId: string,
  isPremiumMessage: boolean,
) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return await db
    .insert(userUsagesTable)
    .values({
      userId,
      year: currentYear,
      month: currentMonth,
      messagesCount: isPremiumMessage ? 0 : 1,
      premiumMessagesCount: isPremiumMessage ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: [
        userUsagesTable.userId,
        userUsagesTable.year,
        userUsagesTable.month,
      ],
      set: {
        messagesCount: sql`${userUsagesTable.messagesCount} + ${isPremiumMessage ? 0 : 1}`,
        premiumMessagesCount: sql`${userUsagesTable.premiumMessagesCount} + ${isPremiumMessage ? 1 : 0}`,
      },
    })
    .returning();
}

/**
 * Get the user monthly limits
 *
 * @param userId - The user ID
 *
 * @returns The user monthly limits
 */
export async function getUserLimits(userId?: string) {
  const today = new Date();
  const currentDay = today.getDate();

  // Get the last day of the current month
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Calculate days remaining
  const daysUntilNextMonth = lastDayOfMonth - currentDay;

  if (!userId) {
    return {
      messagesLimit: 10,
      premiumMessagesLimit: 0,
      resetsIn: daysUntilNextMonth,
    };
  }

  const user = await getUser(userId);
  if (isFreePlan(user?.planName)) {
    return {
      messagesLimit: 50,
      premiumMessagesLimit: 0,
      resetsIn: daysUntilNextMonth,
    };
  } else {
    return {
      ...getProLimits(),
      resetsIn: daysUntilNextMonth,
    };
  }
}

/**
 * Get the pro plan limits
 */
export function getProLimits() {
  return {
    messagesLimit: 1500,
    premiumMessagesLimit: 200,
  };
}

/**
 * Get AI Experience settings for a user
 *
 * @param userId - The user ID
 *
 * @returns The AI Experience settings for the user
 */
export async function getAIExperienceSettings(
  userId: string,
): Promise<typeof userAIExperienceTable.$inferSelect | undefined> {
  const settings = await db
    .select()
    .from(userAIExperienceTable)
    .where(eq(userAIExperienceTable.id, userId))
    .limit(1);

  return settings[0];
}

/**
 * Save AI Experience settings for a user
 *
 * @param aiExperience - The AI Experience settings
 *
 * @returns The saved AI Experience settings
 */
export async function saveAIExperienceSettings(
  aiExperience: typeof userAIExperienceTable.$inferInsert,
) {
  await db
    .insert(userAIExperienceTable)
    .values(aiExperience)
    .onConflictDoUpdate({
      target: [userAIExperienceTable.id],
      set: {
        name: aiExperience.name,
        role: aiExperience.role,
        about: aiExperience.about,
        customInstructions: aiExperience.customInstructions,
        traits: aiExperience.traits,
      },
    });
}

/**
 * Get all threads for a user
 *
 * @param userId - The user ID
 * @param threadIds - The thread IDs to filter by (optional)
 *
 * @returns The threads for the user
 */
export async function getThreadsForUser(userId: string, threadIds?: string[]) {
  const threads = await db
    .select()
    .from(threadsTable)
    .where(
      threadIds
        ? and(
            eq(threadsTable.userId, userId),
            inArray(threadsTable.localId, threadIds),
          )
        : eq(threadsTable.userId, userId),
    );

  return threads;
}

/**
 * Get all threads for a user and last sync date
 *
 * @param userId - The user ID
 * @param lastSyncDate - The last sync date
 *
 * @returns The threads for the user
 */
export async function getThreadsToSync(userId: string, lastSyncDate: Date) {
  const threads = await db
    .select()
    .from(threadsTable)
    .where(
      and(
        eq(threadsTable.userId, userId),
        gt(threadsTable.updatedAt, lastSyncDate),
      ),
    );

  return threads;
}

/**
 * Create or update a thread
 *
 * @param thread - The thread to create or update
 *
 * @returns The created or updated thread
 */
export async function createOrUpdateThread(
  thread: typeof threadsTable.$inferInsert,
) {
  return db
    .insert(threadsTable)
    .values(thread)
    .onConflictDoUpdate({
      target: [threadsTable.userId, threadsTable.localId],
      set: {
        title: thread.title,
        model: thread.model,
        modelParams: thread.modelParams,
        pinned: thread.pinned,
        lastMessageAt: thread.lastMessageAt,
        updatedAt: thread.updatedAt,
        status: thread.status,
      },
    });
}

/**
 * Get all messages for a user
 *
 * @param userId - The user ID
 * @param messagesIds - The message IDs to filter by (optional)
 *
 * @returns The messages for the user
 */
export async function getMessagesForUser(
  userId: string,
  messagesIds?: string[],
) {
  const messages = await db
    .select()
    .from(messagesTable)
    .where(
      messagesIds
        ? and(
            eq(messagesTable.userId, userId),
            inArray(messagesTable.localId, messagesIds),
          )
        : eq(messagesTable.userId, userId),
    );

  return messages;
}

/**
 * Create or update a message
 *
 * @param message - The message to create or update
 *
 * @returns The created or updated message
 */
export async function createOrUpdateMessage(
  message: typeof messagesTable.$inferInsert,
) {
  return db
    .insert(messagesTable)
    .values(message)
    .onConflictDoUpdate({
      target: [threadsTable.userId, threadsTable.localId],
      set: {
        model: message.model,
        modelParams: message.modelParams,
        content: message.content,
        toolResponses: message.toolResponses,
        reasoning: message.reasoning,
        searchMetadata: message.searchMetadata,
        serverError: message.serverError,
        role: message.role,
        updatedAt: message.updatedAt,
        status: message.status,
      },
    });
}

/**
 * Get all messages for a user and last sync date
 *
 * @param userId - The user ID
 * @param lastSyncDate - The last sync date
 *
 * @returns The threads for the user
 */
export async function getMessagesToSync(userId: string, lastSyncDate: Date) {
  const messages = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.userId, userId),
        gt(messagesTable.updatedAt, lastSyncDate),
      ),
    );

  return messages;
}

/**
 * Clear all sync data for a user
 *
 * @param userId - The user ID
 */
export async function clearAllSyncDataForUser(userId: string) {
  await db.delete(messagesTable).where(eq(messagesTable.userId, userId));
  await db.delete(threadsTable).where(eq(threadsTable.userId, userId));
}
