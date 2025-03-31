CREATE TABLE "user_ai_experience" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(100) NOT NULL,
	"about" text NOT NULL,
	"custom_instructions" text NOT NULL,
	"traits" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
