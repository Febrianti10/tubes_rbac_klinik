import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

export const rekamMedisRoutes = new Elysia({ prefix: "/rekam-medis" })
  .get(
    "/",
    async () => {
      return await db.rekamMedis.findMany({
        include: {
          pasien: true,
          dokter: { select: { username: true } },
          antrian: {
            include: {
              pembayaran: true,
            },
          },
        },
        orderBy: { tglPeriksa: "desc" },
      });
    },
    {
      beforeHandle: rbacMiddleware("REKAM_READ_ALL"),
    },
  )
  .get(
    "/history",
    async ({ user }: any) => {
      return await db.rekamMedis.findMany({
        where: {
          pasien: { userId: user.id },
        },
        include: {
          dokter: { select: { username: true } },
          antrian: {
            include: { pembayaran: true },
          },
        },
        orderBy: { tglPeriksa: "desc" },
      });
    },
    {
      beforeHandle: rbacMiddleware("REKAM_READ_OWN"),
    },
  )
  .post(
    "/",
    async ({ body, user, set }: any) => {
      try {
        const antrian = await db.antrian.findUnique({
          where: { id: body.antrianId },
          include: {
            rekamMedis: true,
            pembayaran: true,
          },
        });

        if (!antrian) {
          set.status = 404;
          return { status: "error", message: "Antrian tidak ditemukan." };
        }

        if (antrian.rekamMedis) {
          set.status = 400;
          return {
            status: "error",
            message: "Antrian ini sudah memiliki rekam medis.",
          };
        }

        const result = await db.$transaction(async (tx) => {
          const newRecord = await tx.rekamMedis.create({
            data: {
              pasienId: body.pasienId,
              dokterId: user.id,
              keluhan: body.keluhan,
              diagnosa: body.diagnosa,
              resep: body.resep,
              antrianId: body.antrianId,
            },
            include: {
              pasien: true,
              dokter: { select: { username: true } },
            },
          });

          if (!antrian.pembayaran) {
            await tx.pembayaran.create({
              data: {
                antrianId: body.antrianId,
                jumlah: body.totalBiaya,
                status: "BELUM_BAYAR",
              },
            });
          }

          await tx.antrian.update({
            where: { id: body.antrianId },
            data: { status: "SELESAI" },
          });

          return newRecord;
        });

        return { status: "success", data: result };
      } catch (error) {
        set.status = 400;
        return {
          status: "error",
          message: "Gagal simpan data pemeriksaan.",
          error,
        };
      }
    },
    {
      beforeHandle: rbacMiddleware("REKAM_CREATE"),
      body: t.Object({
        pasienId: t.String(),
        antrianId: t.String(),
        keluhan: t.String(),
        diagnosa: t.String(),
        resep: t.Optional(t.String()),
        totalBiaya: t.Number(),
      }),
    },
  );
