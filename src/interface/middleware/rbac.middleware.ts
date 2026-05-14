import { PrismaUserRepository } from "../../infrastructure/repositories/prisma-user.repository";
import { CheckPermissionUseCase } from "../../application/usecases/permission/check-permission.usecase";

/**
 * rbacMiddleware  (A2 - Aisyah)
 *
 * Factory function yang mengembalikan Elysia beforeHandle handler.
 * Berbeda dengan rbac.plugin.ts yang cek permission langsung dari JWT payload,
 * middleware ini memvalidasi permission secara real-time dari DATABASE
 * melalui CheckPermissionUseCase — cocok untuk skenario di mana role user
 * bisa berubah sewaktu-waktu tanpa re-login.
 *
 * Cara pakai di route:
 *   .get("/admin", handler, { beforeHandle: rbacMiddleware("USER_ALL") })
 */
export const rbacMiddleware = (requiredPermission: string) => {
  const userRepo = new PrismaUserRepository();
  const checkPermissionUseCase = new CheckPermissionUseCase(userRepo);

  return async ({ jwt, headers, set }: any) => {
    // 1. Ambil token dari header Authorization: Bearer <token>
    const authHeader =
      headers["authorization"] || headers["Authorization"];

    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Token tidak ditemukan. Silakan login terlebih dahulu." };
    }

    const token = authHeader.split(" ")[1];

    // 2. Verifikasi Token JWT
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { error: "Sesi telah berakhir atau token tidak valid." };
    }

    // 3. Cek permission via database (real-time, bukan hanya dari payload)
    //    Ini memastikan perubahan role setelah login tetap terefleksi.
    try {
      const allowed = await checkPermissionUseCase.execute(
        payload.id,
        requiredPermission
      );

      if (!allowed) {
        set.status = 403;
        return {
          error: `Akses ditolak. Anda memerlukan izin '${requiredPermission}' untuk mengakses fitur ini.`,
        };
      }
    } catch (e: any) {
      set.status = 403;
      return { error: e.message };
    }

    // 4. Lolos — simpan user ke store agar handler bisa membacanya
    //    Contoh: const { user } = store; di dalam handler
  };
};