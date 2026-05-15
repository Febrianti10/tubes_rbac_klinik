// =============================================================================
// KlinikCare — src/infrastructure/database/prisma-client.ts
// Author  : Feby (Backend Lead — A1)
// Fungsi  : Singleton Prisma Client agar koneksi ke MySQL tidak berlebihan
//           (mencegah hot-reload membuat koneksi baru terus-menerus di dev mode)
// =============================================================================

import { PrismaClient } from "@prisma/client";

// Trik singleton: simpan instance di globalThis agar tidak terbuat ulang
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // tampilkan query SQL di terminal saat dev
        : ["error"], // production: hanya error
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
