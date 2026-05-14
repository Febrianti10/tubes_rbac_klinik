import type { IUserRepository } from "../../../domain/repositories/user.repository";

/**
 * CheckPermissionUseCase
 *
 * Use Case (A2 - Aisyah): memeriksa apakah seorang user memiliki
 * permission tertentu berdasarkan peran yang dimilikinya.
 *
 * Dipanggil oleh middleware (rbac.plugin.ts) dan bisa dipanggil
 * langsung dari route mana pun yang butuh cek permission secara eksplisit.
 */
export class CheckPermissionUseCase {
  constructor(private userRepo: IUserRepository) {}

  /**
   * Cek apakah user dengan userId memiliki permission yang diminta.
   *
   * @param userId         - ID user yang akan dicek
   * @param requiredPermission - Nama permission yang dibutuhkan, misal "USER_CREATE"
   * @returns true jika punya, false jika tidak
   * @throws Error jika user tidak ditemukan di database
   */
  async execute(userId: string, requiredPermission: string): Promise<boolean> {
    // 1. Validasi argumen dasar
    if (!userId || !requiredPermission) {
      throw new Error("userId dan requiredPermission wajib diisi.");
    }

    // 2. Ambil data user beserta relasi roles → permissions dari database
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    // 3. Kumpulkan semua nama permission yang dimiliki user
    //    Struktur: user.roles[] → role.permissions[] → permission.name
    const userPermissions: string[] = (user as any).roles?.flatMap(
      (ur: any) =>
        ur.role?.permissions?.map((rp: any) => rp.permission?.name) ?? []
    ) ?? [];

    // 4. Hilangkan duplikasi lalu cek keberadaan permission yang diminta
    const uniquePermissions = [...new Set(userPermissions)];
    return uniquePermissions.includes(requiredPermission);
  }

  /**
   * Versi batch: cek apakah user memiliki SEMUA permission dalam daftar.
   * Berguna untuk endpoint yang butuh lebih dari satu permission sekaligus.
   *
   * @param userId      - ID user yang akan dicek
   * @param permissions - Daftar permission yang semuanya harus dimiliki
   * @returns true hanya jika user punya semua permission yang diminta
   */
  async hasAll(userId: string, permissions: string[]): Promise<boolean> {
    for (const perm of permissions) {
      const ok = await this.execute(userId, perm);
      if (!ok) return false;
    }
    return true;
  }

  /**
   * Versi batch: cek apakah user memiliki SALAH SATU permission dalam daftar.
   *
   * @param userId      - ID user yang akan dicek
   * @param permissions - Daftar permission, cukup satu yang cocok
   * @returns true jika user punya setidaknya satu permission
   */
  async hasAny(userId: string, permissions: string[]): Promise<boolean> {
    for (const perm of permissions) {
      const ok = await this.execute(userId, perm);
      if (ok) return true;
    }
    return false;
  }
}