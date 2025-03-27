import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "pro"]);

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  planName: tierEnum("plan_name").default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 25 }),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  usages: many(userUsagesTable),
}));

export const userUsagesTable = pgTable(
  "user_usages",
  {
    userId: varchar("user_id").notNull(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    messagesCount: integer("messages_count").default(0).notNull(),
    premiumMessagesCount: integer("premium_messages_count")
      .default(0)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.year, table.month] })],
);

export const userUsagesRelations = relations(userUsagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userUsagesTable.userId],
    references: [usersTable.id],
  }),
}));
