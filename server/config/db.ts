import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaClientSingleton = () => {
  const client = new PrismaClient();

  // Only use Accelerate in production or when DATABASE_URL contains accelerate
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("accelerate")) {
    return client.$extends(withAccelerate());
  }

  return client;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
