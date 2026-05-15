import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

export const pembayaranRoutes = new Elysia({ prefix: "/pembayaran" })

  // 1. Ambil Semua Riwayat Pembayaran (Untuk Admin/Kasir)
  .get("/", async () => {
    return await db.pembayaran.findMany({
      include: {
        antrian: {
          include: {
            pasien: { select: { nama: true, noRM: true } },
            jadwal: { include: { dokter: { select: { username: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }, {
    beforeHandle: rbacMiddleware("READ_TAGIHAN")
  })

  // 2. Ambil Tagihan Saya (Untuk Pasien melihat riwayat bayarnya sendiri)
  .get("/my", async ({ user }: any) => {
    return await db.pembayaran.findMany({
      where: {
        antrian: {
          pasien: { userId: user.id }
        }
      },
      include: {
        antrian: {
          include: {
            jadwal: { include: { dokter: { select: { username: true } } } }
          }
        }
      }
    });
  }, {
    beforeHandle: rbacMiddleware("READ_OWN_TAGIHAN")
  })

  // 3. Input Pembayaran (Oleh Kasir)
  // Alur: Simpan data bayar -> Update status antrian jadi 'SELESAI'
  .post("/", async ({ body, set }: any) => {
    try {
      const result = await db.$transaction(async (tx) => {
        // 1. Buat record pembayaran
        const bayar = await tx.pembayaran.create({
          data: {
            jumlah: body.jumlah,
            metode: body.metode,
            status: "LUNAS",
            antrian: { connect: { id: body.antrianId } }
          }
        });

        // 2. Update status antrian terkait
        await tx.antrian.update({
          where: { id: body.antrianId },
          data: { status: "SELESAI" }
        });

        return bayar;
      });

      return { 
        status: "success", 
        message: "Pembayaran berhasil diproses", 
        data: result 
      };

    } catch (error) {
      set.status = 400;
      return { 
        status: "error", 
        message: "Gagal proses pembayaran. Pastikan ID Antrian benar dan belum dibayar." 
      };
    }
  }, {
    beforeHandle: rbacMiddleware("CREATE_PEMBAYARAN"),
    body: t.Object({
      antrianId: t.String(),
      total: t.Number(),
      metode: t.String() // Contoh: "TUNAI", "QRIS", "DEBIT"
    })
  });