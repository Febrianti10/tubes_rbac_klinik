import { Elysia, t } from "elysia";
import { rbacMiddleware } from "../middleware/rbac.middleware";
import { db } from "../../infrastructure/database/prisma-client";

// Definisi constant permission (sesuaikan dengan yang dibuat A1/A2)
const PERMISSION = {
  READ_PASIEN: "READ_PASIEN",
  WRITE_PASIEN: "WRITE_PASIEN",
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
      };catch (error) { 
        return {
          status: "error",
          message: "Gagal mengambil data pasien",
        };
      } 
    },
    {
      beforeHandle: rbacMiddleware(PERMISSION.READ_PASIEN),
    }
  )

  // ENDPOINT 2: Tambah Pasien Baru (Butuh izin WRITE_PASIEN)
  .post(
    "/",
    ({ body, user }: any) => {
      // Nanti di sini panggil Prisma untuk insert ke DB
      return {
        status: "success",
        message: "Data pasien berhasil ditambahkan",
        dicatat_oleh: user.username,
        data: body,
      };
    },
    {
      beforeHandle: rbacMiddleware(PERMISSION.WRITE_PASIEN),
      body: t.Object({
        nama: t.String(),
        nik: t.String(),
        tanggalLahir: t.String(),
        alamat: t.String(),
      }),
    }
  );