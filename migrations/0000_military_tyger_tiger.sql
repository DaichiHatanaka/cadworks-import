CREATE TABLE "cwx_data" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"list_type" text NOT NULL,
	"kid" text NOT NULL,
	"id_count" text NOT NULL,
	"kiki_no" text NOT NULL,
	"kiki_bame" text NOT NULL,
	"qty_ord" text NOT NULL,
	"short_spec" text,
	"cwx_linked_flg" text
);
--> statement-breakpoint
CREATE TABLE "job_locks" (
	"job_no" text PRIMARY KEY NOT NULL,
	"locked_by_user_id" text NOT NULL,
	"locked_by_user_name" text NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"lock_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_results" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"cad_id" text NOT NULL,
	"tbom_id" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbom_data" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"list_type" text NOT NULL,
	"kid" text NOT NULL,
	"id_count" text NOT NULL,
	"kiki_no" text NOT NULL,
	"kiki_bame" text NOT NULL,
	"qty_ord" text NOT NULL,
	"short_spec" text
);
--> statement-breakpoint
ALTER TABLE "link_results" ADD CONSTRAINT "link_results_cad_id_cwx_data_id_fk" FOREIGN KEY ("cad_id") REFERENCES "public"."cwx_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_results" ADD CONSTRAINT "link_results_tbom_id_tbom_data_id_fk" FOREIGN KEY ("tbom_id") REFERENCES "public"."tbom_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cwx_data_job_no_idx" ON "cwx_data" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "cwx_data_job_list_type_idx" ON "cwx_data" USING btree ("job_no","list_type");--> statement-breakpoint
CREATE INDEX "job_locks_expires_at_idx" ON "job_locks" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "link_results_job_no_idx" ON "link_results" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "link_results_cad_id_idx" ON "link_results" USING btree ("cad_id");--> statement-breakpoint
CREATE INDEX "tbom_data_job_no_idx" ON "tbom_data" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "tbom_data_job_list_type_idx" ON "tbom_data" USING btree ("job_no","list_type");