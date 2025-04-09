import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "pro"]);

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  planName: tierEnum("plan_name").default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 25 }),

  enableSync: boolean("enable_sync").default(true).notNull(),
});

export const userAIExperienceTable = pgTable("user_ai_experience", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  about: text("about").notNull(),
  customInstructions: text("custom_instructions").notNull(),
  traits: text("traits")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
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

export const threadsTable = pgTable(
  "threads",
  {
    userId: varchar("user_id").notNull(),
    localId: varchar("local_id").notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    model: varchar("model", { length: 20 }).notNull(),
    modelParams: json("model_params").notNull(),
    pinned: boolean("pinned").default(false).notNull(),
    lastMessageAt: timestamp("last_message_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    status: varchar("status", { length: 20 }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.localId] })],
);

export const threadsRelations = relations(threadsTable, ({ many }) => ({
  messages: many(messagesTable),
}));

export const messagesTable = pgTable(
  "messages",
  {
    userId: varchar("user_id").notNull(),
    localId: varchar("local_id").notNull(),
    threadId: varchar("thread_id").notNull(),
    model: varchar("model", { length: 20 }).notNull(),
    modelParams: json("model_params").notNull(),
    content: text("content").notNull(),
    kind: varchar("kind", { length: 20 }),
    toolResponses: json("tool_responses"),
    reasoning: text("reasoning"),
    searchMetadata: json("search_metadata"),
    serverError: json("server_error"),
    role: varchar("role", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    status: varchar("status", { length: 20 }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.localId] })],
);

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  thread: one(threadsTable, {
    fields: [messagesTable.threadId, messagesTable.userId],
    references: [threadsTable.localId, threadsTable.userId],
  }),
}));
