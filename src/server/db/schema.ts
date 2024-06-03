// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `negotiation-system-test_${name}`,
);

export const disputes = createTable("disputes", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const disputeRelations = relations(disputes, ({ many }) => ({
  bids: many(bids),
}));

export const bids = createTable(
  "bids",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    disputeId: int("dispute_id", { mode: "number" }).notNull(),
    amount: int("amount", { mode: "number" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).notNull(),
    state: text("state", {
      mode: "text",
      enum: ["settled", "voided", "pending", "rejected"],
    })
      .default("pending")
      .notNull(),
  },
  (example) => ({
    disputeIdIndex: index("dispute_id_idx").on(example.disputeId),
  }),
);

export const bidRelations = relations(bids, ({ one }) => ({
  dispute: one(disputes, {
    fields: [bids.disputeId],
    references: [disputes.id],
  }),
}));
