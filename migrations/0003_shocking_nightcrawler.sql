CREATE TABLE "selection_condition_defs" (
	"id" text PRIMARY KEY NOT NULL,
	"list_type" text NOT NULL,
	"condition_no" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_common" boolean DEFAULT false NOT NULL,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE "selection_results" (
	"id" text PRIMARY KEY NOT NULL,
	"cost_item_id" text NOT NULL,
	"product_id" text,
	"status" text NOT NULL,
	"candidate_count" integer DEFAULT 0 NOT NULL,
	"condition_log" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbom_product_attributes" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"attr_key" text NOT NULL,
	"attr_value" text NOT NULL,
	"numeric_value" real
);
--> statement-breakpoint
CREATE TABLE "tbom_product_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"list_type" text NOT NULL,
	"product_name" text NOT NULL,
	"maker" text,
	"maker_model" text,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"vendor_list_checked" boolean DEFAULT false NOT NULL,
	"recommended" boolean DEFAULT false NOT NULL,
	"weight" real,
	"volume" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cost_items" ADD COLUMN "selected_product_id" text;--> statement-breakpoint
ALTER TABLE "cost_items" ADD COLUMN "selection_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "selection_condition_defs" ADD CONSTRAINT "selection_condition_defs_list_type_list_type_master_list_type_fk" FOREIGN KEY ("list_type") REFERENCES "public"."list_type_master"("list_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_results" ADD CONSTRAINT "selection_results_cost_item_id_cost_items_id_fk" FOREIGN KEY ("cost_item_id") REFERENCES "public"."cost_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_results" ADD CONSTRAINT "selection_results_product_id_tbom_product_catalog_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tbom_product_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbom_product_attributes" ADD CONSTRAINT "tbom_product_attributes_product_id_tbom_product_catalog_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tbom_product_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbom_product_catalog" ADD CONSTRAINT "tbom_product_catalog_list_type_list_type_master_list_type_fk" FOREIGN KEY ("list_type") REFERENCES "public"."list_type_master"("list_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "selection_condition_defs_list_type_idx" ON "selection_condition_defs" USING btree ("list_type");--> statement-breakpoint
CREATE INDEX "selection_results_cost_item_id_idx" ON "selection_results" USING btree ("cost_item_id");--> statement-breakpoint
CREATE INDEX "tbom_product_attributes_product_id_idx" ON "tbom_product_attributes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tbom_product_attributes_key_idx" ON "tbom_product_attributes" USING btree ("product_id","attr_key");--> statement-breakpoint
CREATE INDEX "tbom_product_catalog_list_type_idx" ON "tbom_product_catalog" USING btree ("list_type");