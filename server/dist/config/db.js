"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const extension_accelerate_1 = require("@prisma/extension-accelerate");
const prismaClientSingleton = () => {
    const client = new client_1.PrismaClient();
    // Only use Accelerate in production or when DATABASE_URL contains accelerate
    if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("accelerate")) {
        return client.$extends((0, extension_accelerate_1.withAccelerate)());
    }
    return client;
};
exports.prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = exports.prisma;
}
