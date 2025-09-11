import { Router } from "express";
import { z } from "zod";
import { Event } from "../models/Event";
import { Stadium } from "../models/Stadium";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

const ticketCategorySchema = z.object({
  name: z.string().min(1).max(60),
  price: z.number().min(0),
  quota: z.number().int().min(0)
});

const createSchema = z.object({
  stadium: z.string().min(1),
  title: z.string().min(1).max(140),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  ticketCategories: z.array(ticketCategorySchema).optional().default([]),
  isPublished: z.boolean().optional().default(false)
});

const updateSchema = createSchema.partial();

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const input = createSchema.parse(req.body);

    const exists = await Stadium.exists({ _id: input.stadium });
    if (!exists) return res.status(400).json({ error: "Invalid stadium" });

    const created = await Event.create(input);
    return res.status(201).json(created);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const { stadium, from, to, isPublished, page = "1", limit = "20" } = req.query as any;
  const filter: any = {};
  if (stadium) filter.stadium = stadium;
  if (from || to) {
    filter.startsAt = {};
    if (from) filter.startsAt.$gte = new Date(from);
    if (to) filter.startsAt.$lte = new Date(to);
  }

  const auth = (req as any).auth as { role?: string } | undefined;
  if (!auth?.role || auth.role !== "admin") {
    filter.isPublished = true;
  } else if (typeof isPublished !== "undefined") {
    filter.isPublished = isPublished === "true";
  }

  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Event.find(filter)
      .sort({ startsAt: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Event.countDocuments(filter)
  ]);

  return res.json({ items, page: pageNum, limit: limitNum, total });
});

router.get("/:id", requireAuth, async (req, res) => {
  const one = await Event.findById(req.params.id).lean();
  if (!one) return res.status(404).json({ error: "Not found" });

  // Non-admin users cannot view unpublished events
  const auth = (req as any).auth as { role?: string } | undefined;
  if ((!auth?.role || auth.role !== "admin") && !one.isPublished) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(one);
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const input = updateSchema.parse(req.body);
    if (input.stadium) {
      const exists = await Stadium.exists({ _id: input.stadium });
      if (!exists) return res.status(400).json({ error: "Invalid stadium" });
    }
    // Adjust publishedAt if isPublished flips
    if (typeof (input as any).isPublished !== "undefined") {
      (input as any).publishedAt = (input as any).isPublished ? new Date() : undefined;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, input, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Publish/unpublish endpoints
router.post("/:id/publish", requireAuth, requireAdmin, async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, { isPublished: true, publishedAt: new Date() }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

router.post("/:id/unpublish", requireAuth, requireAdmin, async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, { isPublished: false, publishedAt: undefined }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const deleted = await Event.findByIdAndDelete(req.params.id).lean();
  if (!deleted) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

export default router;
