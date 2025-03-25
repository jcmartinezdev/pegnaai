"only server";

import { eq } from "drizzle-orm";
import { db } from ".";
import { usersTable } from "./schema";

export async function getUser(id: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return users[0];
}

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
