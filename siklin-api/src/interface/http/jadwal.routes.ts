import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

export const jadwalRoutes = new Elysia({ prefix: "/jadwal" })
  
  // 1. Ambil Semua Jadwal (Untuk Pasien saat mau daftar antrian)
  .get("/", async () => {
    return await db.jadwal.findMany({
      include: {
        dokter: {
          select: {
            id: true,
            username: true, // Nama dokter diambil dari tabel User
          }
        },
        _count: {
          select: { antrian: true } // Bisa buat hitung sisa kuota nanti di frontend
        }
    }
    });
  }, { 
    // DI SINI TEMPATNYA:
    beforeHandle: rbacMiddleware("JADWAL_READ") 
  })
  // 2. Tambah Jadwal Baru (Hanya Admin / Dokter)
  .post("/", async ({ body, set }: any) => {
    try {
      const baru = await db.jadwal.create({
        data: {
          hari: body.hari,
          jamMulai: body.jamMulai,
          jamSelesai: body.jamSelesai,
          kuota: body.kuota,
          dokterId: body.dokterId // ID User yang memiliki role Dokter
        }
      });
      return { status: "success", data: baru };
    } catch (error) {
      set.status = 400;
      return { status: "error", message: "Gagal membuat jadwal." };
    }
  }, {
    beforeHandle: rbacMiddleware("JADWAL_MANAGE"),
    body: t.Object({
      hari: t.String(),         // Contoh: "Senin"
      jamMulai: t.String(),     // Contoh: "08:00"
      jamSelesai: t.String(),   // Contoh: "12:00"
      kuota: t.Number(),        // Contoh: 20
      dokterId: t.String()
    })
  })

  // 3. Update Jadwal (Misal kuota penuh atau ganti jam)
  .patch("/:id", async ({ params, body }) => {
    return await db.jadwal.update({
      where: { id: params.id },
      data: body
    });
  }, {
    beforeHandle: rbacMiddleware("JADWAL_MANAGE"),
    body: t.Object({
      hari: t.Optional(t.String()),
      kuota: t.Optional(t.Number()),
      jamMulai: t.Optional(t.String()),
      jamSelesai: t.Optional(t.String())
    })
  })

  // 4. Hapus Jadwal
  .delete("/:id", async ({ params }) => {
    return await db.jadwal.delete({
      where: { id: params.id }
    });
  }, {
    beforeHandle: rbacMiddleware("JADWAL_MANAGE")
  });
