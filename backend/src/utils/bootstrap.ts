import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/User";
import { env } from "../config/env";

export async function ensureAdminUser(): Promise<void> {
  if (!env.adminEmail || !env.adminPassword) {
    return; // noop if not configured
  }
  const email = env.adminEmail.toLowerCase().trim();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return; // already there
  }
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await User.create({ email, passwordHash, firstName: "Admin", lastName: "User", role: UserRole.ADMIN });
  console.log(`✅ Admin user created: ${email}`);
}


