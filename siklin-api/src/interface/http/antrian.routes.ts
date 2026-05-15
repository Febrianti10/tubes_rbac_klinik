import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

export const antrianRoutes = new Elysia({ prefix: "/antrian" })
  
  // 1. Ambil Semua Antrian HARI INI (Untuk Admin/Perawat)
  .get("/", 
    async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db.antrian.findMany({
      where: {
        createdAt: {
          gte: today // Hanya ambil antrian mulai dari jam 00:00 hari ini
        }
      },
      include: {
        pasien: { select: { nama: true, noRM: true } },
        jadwal: { include: { dokter: { select: { username: true } } } }
      },
      orderBy: { nomorAntrian: 'asc' }
    });
  }, {
    beforeHandle: rbacMiddleware("READ_ANTRIAN")
  })

  // 2. Ambil Nomor Antrian Baru (Untuk Pasien)
  .post("/AntrianBaru", 
    async ({ body, user, set }: any) => {
    try {
      // Cari data pasien berdasarkan userId yang sedang login
      const pasien = await db.pasien.findUnique({
        where: { userId: user.id }
      });

      if (!pasien) {
        set.status = 404;
        return { status: "error", message: "Anda belum terdaftar sebagai pasien." };
      }

      // Hitung jumlah antrian hari ini untuk menentukan nomor antrian berikutnya
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const countToday = await db.antrian.count({
        where: { createdAt: { gte: today } }
      });

      const nextNomor = countToday + 1;

      // Buat data antrian baru
      const baru = await db.antrian.create({
        data: {
          nomorAntrian: nextNomor,
          status: "MENUNGGU",
          pasien: { connect: { id: pasien.id } },
          jadwal: { connect: { id: body.jadwalId } }
        }
      });

      return { status: "success", data: baru };

    } catch (error) {
      set.status = 400;
      return { status: "error", message: "Gagal mengambil antrian." };
    }
  }, {
    beforeHandle: rbacMiddleware("CREATE_ANTRIAN"),
    body: t.Object({
      jadwalId: t.String() // Pasien memilih jadwal dokter mana
    })
  })

  // 3. Update Status Antrian (Misal: Dari MENUNGGU ke DIPERIKSA)
  .patch("/:id/status", async ({ params, body }) => {
    return await db.antrian.update({
      where: { id: params.id },
      data: { status: body.status }
    });
  }, {
    beforeHandle: rbacMiddleware("UPDATE_ANTRIAN"),
    body: t.Object({
      status: t.String() // misal: "DIPERIKSA", "SELESAI", "BATAL"
    })
  });