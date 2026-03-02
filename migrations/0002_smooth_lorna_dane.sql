CREATE TABLE "cost_item_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_item_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"cost_item_id" text NOT NULL,
	"category" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_items" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"name" text NOT NULL,
	"classification" text,
	"sub_number" text,
	"skid_group_no" text,
	"skid_no" text,
	"equipment_no" text,
	"short_spec" text,
	"maker" text,
	"maker_model" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"weight" real,
	"volume" real,
	"el_flag" boolean DEFAULT false NOT NULL,
	"flow_sheet_no" text,
	"remarks" text,
	"list_type" text,
	"folder_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"estimation_status" text DEFAULT 'unestimated' NOT NULL,
	"source_type" text DEFAULT 'manual' NOT NULL,
	"link_result_id" text,
	"procurement" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"job_no" text NOT NULL,
	"category" text NOT NULL,
	"value" text NOT NULL,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cost_item_tags" ADD CONSTRAINT "cost_item_tags_cost_item_id_cost_items_id_fk" FOREIGN KEY ("cost_item_id") REFERENCES "public"."cost_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_list_type_list_type_master_list_type_fk" FOREIGN KEY ("list_type") REFERENCES "public"."list_type_master"("list_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_folder_id_cost_item_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."cost_item_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_link_result_id_link_results_id_fk" FOREIGN KEY ("link_result_id") REFERENCES "public"."link_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cost_item_folders_job_no_idx" ON "cost_item_folders" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "cost_item_folders_parent_id_idx" ON "cost_item_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "cost_item_tags_cost_item_id_idx" ON "cost_item_tags" USING btree ("cost_item_id");--> statement-breakpoint
CREATE INDEX "cost_item_tags_category_value_idx" ON "cost_item_tags" USING btree ("category","value");--> statement-breakpoint
CREATE INDEX "cost_items_job_no_idx" ON "cost_items" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "cost_items_folder_id_idx" ON "cost_items" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "cost_items_list_type_idx" ON "cost_items" USING btree ("list_type");--> statement-breakpoint
CREATE INDEX "cost_items_link_result_id_idx" ON "cost_items" USING btree ("link_result_id");--> statement-breakpoint
CREATE INDEX "tag_definitions_job_no_idx" ON "tag_definitions" USING btree ("job_no");--> statement-breakpoint
CREATE INDEX "tag_definitions_job_category_idx" ON "tag_definitions" USING btree ("job_no","category");