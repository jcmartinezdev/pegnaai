CREATE TYPE "public"."tier" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "messages" (
	"user_id" varchar NOT NULL,
	"local_id" varchar NOT NULL,
	"thread_id" varchar NOT NULL,
	"model" varchar(20) NOT NULL,
	"model_params" json NOT NULL,
	"content" text NOT NULL,
	"tool_responses" json,
	"reasoning" text,
	"search_metadata" json,
	"server_error" json,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"status" varchar(20),
	CONSTRAINT "messages_user_id_local_id_pk" PRIMARY KEY("user_id","local_id")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"user_id" varchar NOT NULL,
	"local_id" varchar NOT NULL,
	"title" varchar(100) NOT NULL,
	"model" varchar(20) NOT NULL,
	"model_params" json NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"status" varchar(20),
	CONSTRAINT "threads_user_id_local_id_pk" PRIMARY KEY("user_id","local_id")
);
--> statement-breakpoint
CREATE TABLE "user_ai_experience" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(100) NOT NULL,
	"about" text NOT NULL,
	"custom_instructions" text NOT NULL,
	"traits" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
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
