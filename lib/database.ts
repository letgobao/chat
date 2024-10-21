/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
globalThis.prisma = prisma;

export default prisma as PrismaClient;
