import { db } from "./db";
import {
  categories, nominees, payments, sponsors, users, ticketPurchases,
  type Category, type InsertCategory,
  type Nominee, type InsertNominee,
  type Payment, type InsertPayment,
  type Sponsor, type InsertSponsor,
  type User,
  type TicketPurchase, type InsertTicketPurchase,
} from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";
import { scryptSync, randomBytes } from "crypto";

// ── Password helpers ───────────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(stored: string, supplied: string): boolean {
  const [salt, hash] = stored.split(":");
  const suppliedHash = scryptSync(supplied, salt, 64).toString("hex");
  return hash === suppliedHash;
}

// ── Interface ──────────────────────────────────────────────────
export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Nominees
  getNominees(): Promise<(Nominee & { categoryName?: string })[]>;
  getNominee(id: number): Promise<Nominee | undefined>;
  createNominee(nominee: InsertNominee): Promise<Nominee>;
  updateNominee(id: number, nominee: Partial<InsertNominee>): Promise<Nominee>;
  deleteNominee(id: number): Promise<void>;
  addVotes(id: number, amount: number): Promise<void>;
  setVotes(id: number, votes: number): Promise<void>;

  // Payments (votes)
  getPayments(): Promise<(Payment & { nomineeName?: string })[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;

  // Sponsors
  getSponsors(): Promise<Sponsor[]>;
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  deleteSponsor(id: number): Promise<void>;

  // Users
  createUser(email: string, username: string, phoneNumber: string, passwordHash: string): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Ticket Purchases
  createTicketPurchase(purchase: InsertTicketPurchase): Promise<TicketPurchase>;
  getTicketPurchases(): Promise<(TicketPurchase & { userEmail?: string; username?: string })[]>;
  getTicketPurchasesByUser(userId: number): Promise<TicketPurchase[]>;
  getTicketPurchase(id: number): Promise<TicketPurchase | undefined>;
  updateTicketPurchaseStatus(id: number, status: string, virtualTicketUrl?: string, ticketCode?: string): Promise<TicketPurchase>;
  countTicketsByType(ticketType: string): Promise<number>;
}

// ── Implementation ─────────────────────────────────────────────
export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  async getCategory(id: number): Promise<Category | undefined> {
    const [c] = await db.select().from(categories).where(eq(categories.id, id));
    return c;
  }
  async createCategory(category: InsertCategory): Promise<Category> {
    const [c] = await db.insert(categories).values(category).returning();
    return c;
  }
  async updateCategory(id: number, category: InsertCategory): Promise<Category> {
    const [c] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return c;
  }
  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Nominees
  async getNominees(): Promise<(Nominee & { categoryName?: string })[]> {
    const results = await db
      .select({
        id: nominees.id, name: nominees.name, categoryId: nominees.categoryId,
        imageUrl: nominees.imageUrl, votes: nominees.votes, categoryName: categories.name,
      })
      .from(nominees)
      .leftJoin(categories, eq(nominees.categoryId, categories.id));
    return results.map(r => ({ ...r, imageUrl: r.imageUrl || "/placeholder-nominee.png", categoryName: r.categoryName ?? undefined }));
  }
  async getNominee(id: number): Promise<Nominee | undefined> {
    const [n] = await db.select().from(nominees).where(eq(nominees.id, id));
    return n;
  }
  async createNominee(nominee: InsertNominee): Promise<Nominee> {
    const [n] = await db.insert(nominees).values(nominee).returning();
    return n;
  }
  async updateNominee(id: number, nominee: Partial<InsertNominee>): Promise<Nominee> {
    const [n] = await db.update(nominees).set(nominee).where(eq(nominees.id, id)).returning();
    return n;
  }
  async deleteNominee(id: number): Promise<void> {
    await db.delete(nominees).where(eq(nominees.id, id));
  }
  async addVotes(id: number, amount: number): Promise<void> {
    const n = await this.getNominee(id);
    if (n) await db.update(nominees).set({ votes: n.votes + amount }).where(eq(nominees.id, id));
  }
  async setVotes(id: number, votes: number): Promise<void> {
    await db.update(nominees).set({ votes }).where(eq(nominees.id, id));
  }

  // Payments (votes)
  async getPayments(): Promise<(Payment & { nomineeName?: string })[]> {
    const results = await db
      .select({
        id: payments.id, fullName: payments.fullName, email: payments.email,
        phoneNumber: payments.phoneNumber, nomineeId: payments.nomineeId,
        packageName: payments.packageName, votesAmount: payments.votesAmount,
        amountPaid: payments.amountPaid, proofImageUrl: payments.proofImageUrl,
        reference: payments.reference, status: payments.status, createdAt: payments.createdAt,
        nomineeName: nominees.name,
      })
      .from(payments)
      .leftJoin(nominees, eq(payments.nomineeId, nominees.id))
      .orderBy(desc(payments.createdAt));
    return results.map(r => ({ ...r, nomineeName: r.nomineeName ?? undefined }));
  }
  async getPayment(id: number): Promise<Payment | undefined> {
    const [p] = await db.select().from(payments).where(eq(payments.id, id));
    return p;
  }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [p] = await db.insert(payments).values(payment).returning();
    return p;
  }
  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [p] = await db.update(payments).set({ status }).where(eq(payments.id, id)).returning();
    return p;
  }

  // Sponsors
  async getSponsors(): Promise<Sponsor[]> {
    return await db.select().from(sponsors);
  }
  async createSponsor(sponsor: InsertSponsor): Promise<Sponsor> {
    const [s] = await db.insert(sponsors).values(sponsor).returning();
    return s;
  }
  async deleteSponsor(id: number): Promise<void> {
    await db.delete(sponsors).where(eq(sponsors.id, id));
  }

  // Users
  async createUser(email: string, username: string, phoneNumber: string, passwordHash: string): Promise<User> {
    const [u] = await db.insert(users).values({ email, username, phoneNumber, passwordHash }).returning();
    return u;
  }
  async getUserById(id: number): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    return u;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.email, email));
    return u;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.username, username));
    return u;
  }
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Ticket Purchases
  async createTicketPurchase(purchase: InsertTicketPurchase): Promise<TicketPurchase> {
    const [tp] = await db.insert(ticketPurchases).values(purchase).returning();
    return tp;
  }
  async getTicketPurchases(): Promise<(TicketPurchase & { userEmail?: string; username?: string })[]> {
    const results = await db
      .select({
        id: ticketPurchases.id, userId: ticketPurchases.userId,
        ticketType: ticketPurchases.ticketType, amountPaid: ticketPurchases.amountPaid,
        proofImageUrl: ticketPurchases.proofImageUrl, reference: ticketPurchases.reference,
        status: ticketPurchases.status, virtualTicketUrl: ticketPurchases.virtualTicketUrl,
        createdAt: ticketPurchases.createdAt,
        userEmail: users.email, username: users.username,
      })
      .from(ticketPurchases)
      .leftJoin(users, eq(ticketPurchases.userId, users.id))
      .orderBy(desc(ticketPurchases.createdAt));
    return results.map(r => ({ ...r, userEmail: r.userEmail ?? undefined, username: r.username ?? undefined }));
  }
  async getTicketPurchasesByUser(userId: number): Promise<TicketPurchase[]> {
    return await db.select().from(ticketPurchases)
      .where(eq(ticketPurchases.userId, userId))
      .orderBy(desc(ticketPurchases.createdAt));
  }
  async getTicketPurchase(id: number): Promise<TicketPurchase | undefined> {
    const [tp] = await db.select().from(ticketPurchases).where(eq(ticketPurchases.id, id));
    return tp;
  }
  async updateTicketPurchaseStatus(id: number, status: string, virtualTicketUrl?: string, ticketCode?: string): Promise<TicketPurchase> {
    const updateData: any = { status };
    if (virtualTicketUrl !== undefined) updateData.virtualTicketUrl = virtualTicketUrl;
    if (ticketCode !== undefined) updateData.ticketCode = ticketCode;
    const [tp] = await db.update(ticketPurchases).set(updateData).where(eq(ticketPurchases.id, id)).returning();
    return tp;
  }
  async countTicketsByType(ticketType: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(ticketPurchases)
      .where(eq(ticketPurchases.ticketType, ticketType));
    return result?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
