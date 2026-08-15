import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryCategoriesTable = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertInventoryCategorySchema = createInsertSchema(
  inventoryCategoriesTable,
).omit({ id: true, createdAt: true });

export type InsertInventoryCategory = z.infer<
  typeof insertInventoryCategorySchema
>;
export type InventoryCategory = typeof inventoryCategoriesTable.$inferSelect;

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  partNumber: text("part_number").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  description: text("description"),
  manufacturer: text("manufacturer"),
  length: real("length"),
  width: real("width"),
  height: real("height"),
  diameter: real("diameter"),
  headWidth: real("head_width"),
  unit: text("unit").notNull().default("mm"),
  quantity: integer("quantity").notNull().default(0),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertInventoryItemSchema = createInsertSchema(
  inventoryItemsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;