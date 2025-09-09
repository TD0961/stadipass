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
  const { stadium } = req.query as { stadium?: string };
  const filter: any = {};
  if (stadium) filter.stadium = stadium;
  const list = await Event.find(filter).sort({ startsAt: 1 }).lean();
  return res.json(list);
});

router.get("/:id", requireAuth, async (req, res) => {
  const one = await Event.findById(req.params.id).lean();
  if (!one) return res.status(404).json({ error: "Not found" });
  return res.json(one);
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const input = updateSchema.parse(req.body);
    if (input.stadium) {
      const exists = await Stadium.exists({ _id: input.stadium });
      if (!exists) return res.status(400).json({ error: "Invalid stadium" });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, input, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const deleted = await Event.findByIdAndDelete(req.params.id).lean();
  if (!deleted) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

export default router;
