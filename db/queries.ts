"only server";

import { and, eq, sql } from "drizzle-orm";
import { db } from ".";
import { usersTable, userUsagesTable } from "./schema";
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

export async function createUser(user: typeof usersTable.$inferInsert) {
  return db.insert(usersTable).values(user);
}

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
