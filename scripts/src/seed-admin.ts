/**
 * Seed the first admin user.
 * Run with: pnpm --filter @workspace/scripts run seed-admin
 *
 * Set env vars:
 *   ADMIN_USERNAME=admin
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=yourpassword
 */
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const username = process.env.ADMIN_USERNAME ?? "admin";
const email = process.env.ADMIN_EMAIL ?? "admin@arc.local";
const password = process.env.ADMIN_PASSWORD ?? "Admin@12345!";

async function seedAdmin() {
  const existing = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].role === "admin") {
      console.log(`✓ Admin user already exists: ${email}`);
    } else {
      await db.update(usersTable).set({ role: "admin" }).where(eq(usersTable.id, existing[0].id));
      console.log(`✓ Promoted existing user to admin: ${email}`);
    }
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({
      username,
      email,
      passwordHash,
      role: "admin",
      deviceFingerprint: null,
    })
    .returning();

  console.log("✓ Admin user created successfully!");
  console.log(`  Username : ${user.username}`);
  console.log(`  Email    : ${user.email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Role     : ${user.role}`);
  console.log("\n⚠  Change the password after first login!");

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
