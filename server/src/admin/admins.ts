import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

async function addAdmin(username: string, password: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        permissions: { canManageUsers: true, canManageOrders: true },
      },
    });
    console.log("Admin created:", admin);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin("admin@1", "admin@1");
