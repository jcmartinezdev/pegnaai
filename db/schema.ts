import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "pro"]);

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  planName: tierEnum("plan_name").default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 25 }),
});
