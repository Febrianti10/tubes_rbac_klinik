import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

// Definisi constant permission (sesuaikan dengan yang dibuat A1/A2)
const PERMISSION = {
  READ_PASIEN: "PASIEN_READ_ALL",
  WRITE_PASIEN: "PASIEN_CREATE",
};

export const pasienRoutes = new Elysia({ prefix: "/pasien" })
  // ENDPOINT 1: Get Semua Pasien (Butuh izin READ_PASIEN)
  .get(
    "/",
    async ({ user }: any) => {
      // 3. MENGAMBIL DATA DARI DATABASE MENGGUNAKAN PRISMA
        const dataPasien = await db.pasien.findMany();
      
      // Nanti di sini panggil Prisma untuk ambil data asli dari DB
      return {
        status: "success",
        data: dataPasien,
      };
    },
    {
      beforeHandle: rbacMiddleware(PERMISSION.READ_PASIEN),
    }
  )

  // ENDPOINT 2: Tambah Pasien Baru (Butuh izin WRITE_PASIEN)
  .post(
    "/",
    async ({ body, user, set }: any) => {
      try {
        const latest = await db.pasien.findFirst({
          orderBy: { createdAt: "desc" },
          select: { noRM: true },
        });

        const generatedNoRM = (() => {
          if (body.noRM) return body.noRM;
          const lastNumber = latest?.noRM?.match(/(\d+)$/)?.[1];
          const nextNumber = Number(lastNumber || 0) + 1;
          return `RM-${String(nextNumber).padStart(4, "0")}`;
        })();

        const newPasien = await db.pasien.create({
          data: {
            noRM: generatedNoRM,
            nama: body.nama,
            tglLahir: new Date(body.tglLahir),
            jenisKelamin: body.jenisKelamin,
            alamat: body.alamat || null,
            noTelp: body.noTelp || null,
          },
        });

        return {
          status: "success",
          dataPasien: newPasien,
          message: "Data pasien berhasil ditambahkan",
          dicatat_oleh: user.username,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          status: "error",
          message: error.message || "Gagal menambahkan pasien.",
        };
      }
    },
    {
      beforeHandle: rbacMiddleware(PERMISSION.WRITE_PASIEN),
      body: t.Object({
        noRM: t.Optional(t.String()),
        nama: t.String(),
        tglLahir: t.String(),
        jenisKelamin: t.String(),
        alamat: t.Optional(t.String()),
        noTelp: t.Optional(t.String())
      }),
    }
  );
