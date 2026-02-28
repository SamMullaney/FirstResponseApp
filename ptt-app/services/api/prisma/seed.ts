import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.agency.create({
    data: {
      name: "Metro Police Department",
      type: "police",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "officer@metro.gov",
      passwordHash,
      role: "OFFICER",
      agencyId: agency.id,
      badgeNumber: "MPD-1234",
    },
  });

  console.log("Seed complete: 1 agency, 1 user created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
