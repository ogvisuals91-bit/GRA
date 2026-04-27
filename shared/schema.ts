import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const nominees = pgTable("nominees", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  votes: integer("votes").notNull().default(0),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  nomineeId: integer("nominee_id").notNull().references(() => nominees.id, { onDelete: 'cascade' }),
  packageName: text("package_name").notNull(),
  votesAmount: integer("votes_amount").notNull(),
  amountPaid: integer("amount_paid").notNull(),
  proofImageUrl: text("proof_image_url").notNull(),
  reference: text("reference").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Users (for ticket system) ──────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Ticket Purchases ───────────────────────────────────────────
export const ticketPurchases = pgTable("ticket_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticketType: text("ticket_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  amountPaid: integer("amount_paid").notNull(),
  proofImageUrl: text("proof_image_url").notNull(),
  reference: text("reference").notNull(),
  status: text("status").notNull().default("pending"),
  virtualTicketUrl: text("virtual_ticket_url"),
  ticketCode: text("ticket_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Sponsors ───────────────────────────────────────────────────
export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: text("is_active").notNull().default("true"),
});

// ── Relations ──────────────────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  nominees: many(nominees),
}));

export const nomineesRelations = relations(nominees, ({ one, many }) => ({
  category: one(categories, { fields: [nominees.categoryId], references: [categories.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  nominee: one(nominees, { fields: [payments.nomineeId], references: [nominees.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  ticketPurchases: many(ticketPurchases),
}));

export const ticketPurchasesRelations = relations(ticketPurchases, ({ one }) => ({
  user: one(users, { fields: [ticketPurchases.userId], references: [users.id] }),
}));

// ── Schemas & Types ────────────────────────────────────────────
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertNomineeSchema = createInsertSchema(nominees).omit({ id: true, votes: true }).extend({
  imageUrl: z.string().min(1, "Image is required"),
});
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, status: true, createdAt: true });

export const insertUserSchema = z.object({
  email: z.string().email("Valid email required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  phoneNumber: z.string().min(7, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userLoginSchema = z.object({
  emailOrUsername: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export const insertTicketPurchaseSchema = createInsertSchema(ticketPurchases).omit({
  id: true, status: true, virtualTicketUrl: true, createdAt: true,
});

export const insertSponsorSchema = createInsertSchema(sponsors).omit({ id: true });

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Nominee = typeof nominees.$inferSelect;
export type InsertNominee = z.infer<typeof insertNomineeSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TicketPurchase = typeof ticketPurchases.$inferSelect;
export type InsertTicketPurchase = z.infer<typeof insertTicketPurchaseSchema>;
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
