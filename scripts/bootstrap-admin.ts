import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "../lib/database-url";

const shouldSkipWhenMissing = process.argv.includes("--optional");

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    if (shouldSkipWhenMissing) {
      console.log("Skipping admin bootstrap: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.");
      return;
    }

    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  ensureDatabaseUrlInProcessEnv();
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
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
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
