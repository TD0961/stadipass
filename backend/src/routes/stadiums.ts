import { Router } from "express";
import { z } from "zod";
import { Stadium } from "../models/Stadium";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

const sectionSchema = z.object({
  name: z.string().min(1).max(80),
  capacity: z.number().int().min(0)
});

const createSchema = z.object({
  name: z.string().min(1).max(120),
  location: z.string().max(200).optional(),
  capacity: z.number().int().min(0),
  sections: z.array(sectionSchema).optional().default([])
});

const updateSchema = createSchema.partial();

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const input = createSchema.parse(req.body);
    const created = await Stadium.create(input);
    return res.status(201).json(created);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    if (err?.code === 11000) return res.status(409).json({ error: "Stadium name already exists" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  const list = await Stadium.find().sort({ name: 1 }).lean();
  return res.json(list);
});

router.get("/:id", requireAuth, async (req, res) => {
  const one = await Stadium.findById(req.params.id).lean();
  if (!one) return res.status(404).json({ error: "Not found" });
  return res.json(one);
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const input = updateSchema.parse(req.body);
    const updated = await Stadium.findByIdAndUpdate(req.params.id, input, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const deleted = await Stadium.findByIdAndDelete(req.params.id).lean();
  if (!deleted) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

export default router;


