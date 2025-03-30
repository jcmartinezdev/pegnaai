CREATE TYPE "public"."tier" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "user_usages" (
	"user_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"premium_messages_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_usages_user_id_year_month_pk" PRIMARY KEY("user_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"plan_name" "tier" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_status" varchar(25)
);
