import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

export const rekamMedisRoutes = new Elysia({ prefix: "/rekam-medis" })
  // 1. Ambil semua rekam medis (Untuk Dokter/Admin)
  .get("/", async () => { 
    return await db.rekamMedis.findMany({
      include: {
        pasien: true, 
        dokter: { select: { username: true } } 
      }
    });
  }, {
    beforeHandle: rbacMiddleware("READ_REKAMMEDIS")
  })

  // 2. Ambil milik sendiri (Untuk Pasien)
  .get("/history", async ({ user }: any) => {
    return await db.rekamMedis.findMany({
      where: {
        pasien: { userId: user.id }
      },
      include: { 
        dokter: { select: { username: true } } 
      }
    });
  }, {
    beforeHandle: rbacMiddleware("READ_OWN_REKAMMEDIS")
  })

  // 3. Input Rekam Medis (Oleh Dokter)
  .post("/", async ({ body, user, set }: any) => {
    try {
      const newRecord = await db.rekamMedis.create({
        data: {
          // Perbaikan struktur connect di sini:
          pasien: { connect: { id: body.pasienId } },
          dokter: { connect: { id: user.id } }, 
          keluhan: body.keluhan,
          diagnosa: body.diagnosa,
          resep: body.resep,
          ...(body.antrianId && { 
            antrian: { connect: { id: body.antrianId } } 
          })
        } 
      }); 
      
      return { status: "success", data: newRecord };

    } catch (error) {
      set.status = 400;
      return { 
        status: "error", 
        message: "Gagal simpan data. Pastikan ID Pasien dan Antrian benar.",
        error: error
      };
    }
  }, {
    beforeHandle: rbacMiddleware("WRITE_REKAMMEDIS"),
    body: t.Object({
      pasienId: t.String(),
      keluhan: t.String(),
      diagnosa: t.String(),
      resep: t.Optional(t.String()),
      antrianId: t.Optional(t.String())
    })
  });