import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const usageCounts = sqliteTable(
  "usage_counts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventType: text("event_type").notNull(),
    platform: text("platform").notNull(),
    variant: text("variant").notNull().default(""),
    eventDate: text("event_date").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("usage_counts_event_platform_variant_date").on(table.eventType, table.platform, table.variant, table.eventDate)],
);
