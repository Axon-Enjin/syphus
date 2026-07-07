import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash").notNull(),
  tier: varchar("tier", { length: 32 }).notNull().default("solo"),
  monthlyVolumeUsdc: numeric("monthly_volume_usdc", { precision: 18, scale: 7 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  publicKey: varchar("public_key", { length: 56 }).notNull().unique(),
  encryptedSecret: text("encrypted_secret"),
  trustlineReady: boolean("trustline_ready").notNull().default(false),
  anchorKycComplete: boolean("anchor_kyc_complete").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentLinks = pgTable("payment_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  amountUsdc: numeric("amount_usdc", { precision: 18, scale: 7 }),
  memo: varchar("memo", { length: 28 }),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  transactionHash: varchar("transaction_hash", { length: 64 }).notNull().unique(),
  senderAddress: varchar("sender_address", { length: 56 }).notNull(),
  amountUsdc: numeric("amount_usdc", { precision: 18, scale: 7 }).notNull(),
  memo: varchar("memo", { length: 28 }),
  stellarCreatedAt: timestamp("stellar_created_at", { withTimezone: true }).notNull(),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(),
  anchorSessionId: varchar("anchor_session_id", { length: 128 }).notNull(),
  amountUsdc: numeric("amount_usdc", { precision: 18, scale: 7 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  redirectUrl: text("redirect_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const indexerCursors = pgTable("indexer_cursors", {
  walletId: uuid("wallet_id")
    .primaryKey()
    .references(() => wallets.id, { onDelete: "cascade" }),
  pagingToken: text("paging_token"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const anchorHealth = pgTable("anchor_health", {
  provider: varchar("provider", { length: 32 }).primaryKey(),
  status: varchar("status", { length: 16 }).notNull().default("healthy"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  failCount: integer("fail_count").notNull().default(0),
});

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  itemCount: integer("item_count").notNull().default(0),
  totalUsdc: numeric("total_usdc", { precision: 18, scale: 7 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const batchItems = pgTable("batch_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  recipientName: varchar("recipient_name", { length: 255 }).notNull(),
  destinationAddress: varchar("destination_address", { length: 56 }).notNull(),
  amountUsdc: numeric("amount_usdc", { precision: 18, scale: 7 }).notNull(),
  memo: varchar("memo", { length: 28 }),
  sep7Uri: text("sep7_uri").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  transactionHash: varchar("transaction_hash", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type PaymentLink = typeof paymentLinks.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Batch = typeof batches.$inferSelect;
export type BatchItem = typeof batchItems.$inferSelect;
