import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

const ACTIVE_QUEUE_STATUSES = ["MENUNGGU", "DIPERIKSA"];

const createQueueForPatient = async (body: { jadwalId: string }, user: any, set: any) => {
  try {
    const pasien = await db.pasien.findUnique({
      where: { userId: user.id },
    });

    if (!pasien) {
      set.status = 404;
      return {
        status: "error",
        message: "Anda belum terdaftar sebagai pasien.",
      };
    }

    const jadwal = await db.jadwal.findUnique({
      where: { id: body.jadwalId },
      include: {
        _count: {
          select: {
            antrian: true,
          },
        },
      },
    });

    if (!jadwal) {
      set.status = 404;
      return { status: "error", message: "Jadwal tidak ditemukan." };
    }

    if (jadwal._count.antrian >= jadwal.kuota) {
      set.status = 400;
      return { status: "error", message: "Kuota jadwal sudah penuh." };
    }

    const existingQueue = await db.antrian.findFirst({
      where: {
        pasienId: pasien.id,
        status: { in: ACTIVE_QUEUE_STATUSES },
      },
    });

    if (existingQueue) {
      set.status = 400;
      return {
        status: "error",
        message: "Anda masih memiliki antrian aktif yang belum selesai.",
      };
    }

    const lastNumber = await db.antrian.aggregate({
      _max: { nomorAntrian: true },
      where: {
        jadwalId: body.jadwalId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const baru = await db.antrian.create({
      data: {
        nomorAntrian: (lastNumber._max.nomorAntrian || 0) + 1,
        status: "MENUNGGU",
        pasienId: pasien.id,
        jadwalId: body.jadwalId,
      },
      include: {
        pasien: { select: { nama: true, noRM: true } },
        jadwal: {
          include: { dokter: { select: { username: true } } },
        },
      },
    });

    return { status: "success", data: baru };
  } catch {
    set.status = 400;
    return { status: "error", message: "Gagal mengambil antrian." };
  }
};

export const antrianRoutes = new Elysia({ prefix: "/antrian" })
  .get(
    "/",
    async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await db.antrian.findMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
        include: {
          pasien: { select: { id: true, nama: true, noRM: true } },
          jadwal: {
            include: {
              dokter: { select: { id: true, username: true } },
            },
          },
          pembayaran: true,
          rekamMedis: true,
        },
        orderBy: { nomorAntrian: "asc" },
      });
    },
    {
      beforeHandle: rbacMiddleware("ANTRIAN_READ"),
    },
  )
  .get(
    "/saya",
    async ({ user, set }: any) => {
      const pasien = await db.pasien.findUnique({
        where: { userId: user.id },
      });

      if (!pasien) {
        set.status = 404;
        return {
          status: "error",
          message: "Data pasien untuk akun ini tidak ditemukan.",
        };
      }

      const data = await db.antrian.findMany({
        where: { pasienId: pasien.id },
        include: {
          jadwal: {
            include: {
              dokter: { select: { username: true } },
            },
          },
          pembayaran: true,
          rekamMedis: true,
        },
        orderBy: [{ tglDaftar: "desc" }],
      });

      return {
        status: "success",
        data,
      };
    },
    {
      beforeHandle: rbacMiddleware("ANTRIAN_CREATE"),
    },
  )
  .post(
    "/",
    async ({ body, user, set }: any) => createQueueForPatient(body, user, set),
    {
      beforeHandle: rbacMiddleware("ANTRIAN_CREATE"),
      body: t.Object({
        jadwalId: t.String(),
      }),
    },
  )
  .post(
    "/AntrianBaru",
    async ({ body, user, set }: any) => createQueueForPatient(body, user, set),
    {
      beforeHandle: rbacMiddleware("ANTRIAN_CREATE"),
      body: t.Object({
        jadwalId: t.String(),
      }),
    },
  )
  .patch(
    "/:id/status",
    async ({ params, body, set }) => {
      try {
        const antrian = await db.antrian.findUnique({
          where: { id: params.id },
          include: { rekamMedis: true, pembayaran: true },
        });

        if (!antrian) {
          set.status = 404;
          return { status: "error", message: "Antrian tidak ditemukan." };
        }

        if (
          body.status === "SELESAI" &&
          !antrian.rekamMedis &&
          !antrian.pembayaran
        ) {
          set.status = 400;
          return {
            status: "error",
            message: "Antrian tidak bisa diselesaikan sebelum pemeriksaan atau pembayaran dibuat.",
          };
        }

        const updated = await db.antrian.update({
          where: { id: params.id },
          data: { status: body.status },
        });

        return { status: "success", data: updated };
      } catch {
        set.status = 400;
        return { status: "error", message: "Gagal mengubah status antrian." };
      }
    },
    {
      beforeHandle: rbacMiddleware("ANTRIAN_MANAGE"),
      body: t.Object({
        status: t.Union([
          t.Literal("MENUNGGU"),
          t.Literal("DIPERIKSA"),
          t.Literal("SELESAI"),
          t.Literal("BATAL"),
        ]),
      }),
    },
  );
