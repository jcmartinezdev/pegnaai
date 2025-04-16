ALTER TABLE "threads" ADD COLUMN "document" text;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "document";