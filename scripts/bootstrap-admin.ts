import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "../lib/database-url";

ensureDatabaseUrlInProcessEnv();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "ĐẠI THIÊN PHÚ WOOD Admin",
      passwordHash,
      active: true,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "ĐẠI THIÊN PHÚ WOOD Admin",
      passwordHash,
      active: true,
      role: "ADMIN",
    },
  });

  console.log(`Admin account ensured for: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
