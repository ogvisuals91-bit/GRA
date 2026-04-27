import type { Express } from "express";
import type { Server } from "http";
import { storage, hashPassword, verifyPassword } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStoreInit from "memorystore";
import { insertUserSchema, userLoginSchema } from "@shared/schema";

const MemoryStore = MemoryStoreInit(session);

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "ghost_awards_secret",
    })
  );

  // ── Admin Auth ────────────────────────────────────────────────
  app.post(api.auth.login.path, async (req, res) => {
    const { email, password } = api.auth.login.input.parse(req.body);
    if (email === "admin@ghostawards.com" && password === "Ghost_Secret_2026_Admin!") {
      (req.session as any).isAdmin = true;
      return res.json({ success: true });
    }
    res.status(401).json({ message: "Invalid credentials" });
  });

  app.get(api.auth.me.path, (req, res) => {
    res.json({ loggedIn: !!(req.session as any).isAdmin });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  // ── User Auth ─────────────────────────────────────────────────
  app.post("/api/user/signup", async (req, res) => {
    try {
      const { email, username, phoneNumber, password } = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(409).json({ message: "An account with this email already exists" });
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) return res.status(409).json({ message: "Username already taken" });
      const passwordHash = hashPassword(password);
      const user = await storage.createUser(email, username, phoneNumber, passwordHash);
      (req.session as any).userId = user.id;
      res.status(201).json({ id: user.id, email: user.email, username: user.username, phoneNumber: user.phoneNumber });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Signup failed" });
    }
  });

  app.post("/api/user/login", async (req, res) => {
    try {
      const { emailOrUsername, password } = userLoginSchema.parse(req.body);
      const isEmail = emailOrUsername.includes("@");
      const user = isEmail
        ? await storage.getUserByEmail(emailOrUsername)
        : await storage.getUserByUsername(emailOrUsername);
      if (!user) return res.status(401).json({ message: "No account found with those details" });
      if (!verifyPassword(user.passwordHash, password)) return res.status(401).json({ message: "Incorrect password" });
      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email, username: user.username, phoneNumber: user.phoneNumber });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Login failed" });
    }
  });

  app.post("/api/user/logout", (req, res) => {
    (req.session as any).userId = undefined;
    res.json({ success: true });
  });

  app.get("/api/user/me", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.json({ loggedIn: false });
    const user = await storage.getUserById(userId);
    if (!user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, id: user.id, email: user.email, username: user.username, phoneNumber: user.phoneNumber });
  });

  // ── Categories ────────────────────────────────────────────────
  app.get(api.categories.list.path, async (req, res) => {
    res.json(await storage.getCategories());
  });
  app.post(api.categories.create.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.status(201).json(await storage.createCategory(req.body));
  });
  app.put(api.categories.update.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.updateCategory(Number(req.params.id), req.body));
  });
  app.delete(api.categories.delete.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteCategory(Number(req.params.id));
    res.status(204).end();
  });

  // ── Nominees ──────────────────────────────────────────────────
  app.get(api.nominees.list.path, async (req, res) => {
    res.json(await storage.getNominees());
  });
  app.post(api.nominees.create.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.status(201).json(await storage.createNominee(req.body));
  });
  app.put(api.nominees.update.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.updateNominee(Number(req.params.id), req.body));
  });
  app.delete(api.nominees.delete.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteNominee(Number(req.params.id));
    res.status(204).end();
  });
  app.patch("/api/nominees/:id/votes", async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    const { votes } = z.object({ votes: z.number().int().min(0) }).parse(req.body);
    await storage.setVotes(Number(req.params.id), votes);
    res.json(await storage.getNominee(Number(req.params.id)));
  });

  // ── Payments (votes) ──────────────────────────────────────────
  app.get(api.payments.list.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getPayments());
  });
  app.post(api.payments.create.path, async (req, res) => {
    res.status(201).json(await storage.createPayment(req.body));
  });
  app.patch(api.payments.updateStatus.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    const { status } = api.payments.updateStatus.input.parse(req.body);
    const paymentId = Number(req.params.id);
    const old = await storage.getPayment(paymentId);
    if (!old) return res.status(404).json({ message: "Payment not found" });
    const isNewAcceptance = status === "accepted" && old.status !== "accepted";
    const payment = await storage.updatePaymentStatus(paymentId, status);
    if (isNewAcceptance) await storage.addVotes(payment.nomineeId, payment.votesAmount);
    res.json(payment);
  });

  // ── Sponsors ──────────────────────────────────────────────────
  app.get(api.sponsors.list.path, async (req, res) => {
    res.json(await storage.getSponsors());
  });
  app.post(api.sponsors.create.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.status(201).json(await storage.createSponsor(req.body));
  });
  app.delete(api.sponsors.delete.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteSponsor(Number(req.params.id));
    res.status(204).end();
  });

  // ── Ticket Availability ───────────────────────────────────────
  app.get("/api/tickets/availability", async (req, res) => {
    const earlyBirdSold = await storage.countTicketsByType("Early Bird");
    res.json({ earlyBirdSold, earlyBirdRemaining: Math.max(0, 50 - earlyBirdSold) });
  });

  // ── Ticket Purchases (user) ───────────────────────────────────
  app.post("/api/tickets/purchase", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "You must be logged in to purchase a ticket" });
    try {
      const body = z.object({
        ticketType: z.string().min(1),
        quantity: z.number().int().min(1).max(20).default(1),
        amountPaid: z.number().int().positive(),
        proofImageUrl: z.string().min(1),
        reference: z.string().min(1),
      }).parse(req.body);

      // Early bird limit check
      if (body.ticketType === "Early Bird") {
        const sold = await storage.countTicketsByType("Early Bird");
        if (sold + body.quantity > 50) return res.status(400).json({ message: `Only ${50 - sold} Early Bird tickets remaining` });
      }

      const purchase = await storage.createTicketPurchase({ ...body, userId });
      res.status(201).json(purchase);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Purchase failed" });
    }
  });

  app.get("/api/tickets/my", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getTicketPurchasesByUser(userId));
  });

  // ── Ticket Admin ──────────────────────────────────────────────
  app.get("/api/admin/ticket-purchases", async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getTicketPurchases());
  });

  app.patch("/api/admin/ticket-purchases/:id", async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    const body = z.object({
      status: z.enum(["pending", "accepted", "declined"]),
      virtualTicketUrl: z.string().optional(),
      ticketCode: z.string().optional(),
    }).parse(req.body);
    const purchase = await storage.updateTicketPurchaseStatus(
      Number(req.params.id),
      body.status,
      body.virtualTicketUrl,
      body.ticketCode,
    );
    res.json(purchase);
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(401).json({ message: "Unauthorized" });
    const all = await storage.getAllUsers();
    res.json(all.map(u => ({ id: u.id, email: u.email, username: u.username, phoneNumber: u.phoneNumber, createdAt: u.createdAt })));
  });

  // ── Image Upload ──────────────────────────────────────────────
  app.post(api.uploads.create.path, (req, res) => {
    res.status(201).json({ url: "/placeholder-nominee.png" });
  });

  // ── Seed ──────────────────────────────────────────────────────
  async function seed() {
    const cats = await storage.getCategories();
    if (cats.length === 0) {
      const bestArtist = await storage.createCategory({ name: "Best Artist" });
      const nextGen = await storage.createCategory({ name: "Next Gen Star" });
      await storage.createNominee({ name: "Shadow Walker", categoryId: bestArtist.id, imageUrl: "/placeholder-nominee.png" });
      await storage.createNominee({ name: "Luna Gold", categoryId: bestArtist.id, imageUrl: "/placeholder-nominee.png" });
      await storage.createNominee({ name: "Phantom Beats", categoryId: nextGen.id, imageUrl: "/placeholder-nominee.png" });
    }
  }
  seed();

  return httpServer;
}
