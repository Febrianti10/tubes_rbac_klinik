import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding KlinikCare...\n");

  // --------------------------------------------------------
  // 1. SEED PERMISSIONS
  // --------------------------------------------------------
  const permissions = [
    // --- Domain Pasien ---
    { name: "PASIEN_CREATE",      description: "Mendaftarkan pasien baru" },
    { name: "PASIEN_READ_ALL",    description: "Melihat semua data pasien" },
    { name: "PASIEN_READ_OWN",    description: "Melihat data diri sendiri" },
    { name: "PASIEN_UPDATE",      description: "Mengubah data pasien" },
    { name: "PASIEN_DELETE",      description: "Menghapus data pasien" },

    // --- Domain Rekam Medis ---
    { name: "REKAM_CREATE",       description: "Membuat rekam medis baru" },
    { name: "REKAM_READ_ALL",     description: "Membaca semua rekam medis" },
    { name: "REKAM_READ_OWN",     description: "Membaca rekam medis milik sendiri" },
    { name: "REKAM_UPDATE",       description: "Mengubah rekam medis" },

    // --- Domain Jadwal ---
    { name: "JADWAL_MANAGE",      description: "Membuat dan mengubah jadwal praktik" },
    { name: "JADWAL_READ",        description: "Melihat jadwal praktik dokter" },

    // --- Domain Antrian ---
    { name: "ANTRIAN_CREATE",     description: "Mendaftarkan antrian pasien" },
    { name: "ANTRIAN_MANAGE",     description: "Mengelola dan memanggil antrian" },
    { name: "ANTRIAN_READ",       description: "Melihat daftar antrian" },

    // --- Domain Pembayaran ---
    { name: "PEMBAYARAN_CREATE",  description: "Memproses pembayaran" },
    { name: "PEMBAYARAN_READ",    description: "Melihat data pembayaran" },

    // --- Domain User Management (lama) ---
    { name: "USER_MANAGE",        description: "Mengelola akun pengguna (lama)" },
    { name: "ROLE_ASSIGN",        description: "Menetapkan role ke pengguna (lama)" },

    // --- Domain User Management (granular — dipakai di user.routes.ts) ---
    // FIX A2: permission-permission ini sebelumnya tidak ada di seed,
    // sehingga semua endpoint /users selalu mengembalikan 403 Forbidden.
    { name: "USER_ALL",           description: "Melihat semua akun pengguna" },
    { name: "USER_READ",          description: "Melihat detail akun pengguna" },
    { name: "USER_CREATE",        description: "Membuat akun pengguna baru" },
    { name: "USER_UPDATE",        description: "Mengubah data akun pengguna" },
    { name: "USER_DELETE",        description: "Menghapus akun pengguna" },
    { name: "USER_ASSIGN_ROLE",   description: "Menetapkan role ke pengguna" },
  ];

  console.log("📋 Menyimpan permissions...");
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where:  { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`   ✅ ${permissions.length} permission tersimpan.\n`);

  // --------------------------------------------------------
  // 2. SEED ROLES
  // --------------------------------------------------------
  const roles = [
    { name: "SUPERADMIN", description: "Administrator penuh, akses semua fitur" },
    { name: "DOKTER",     description: "Dokter praktik, akses rekam medis dan jadwal" },
    { name: "PERAWAT",    description: "Perawat, akses pendaftaran dan antrian" },
    { name: "KASIR",      description: "Kasir, akses pembayaran" },
    { name: "PASIEN",     description: "Pasien terdaftar, akses data diri sendiri" },
  ];

  console.log("👥 Menyimpan roles...");
  for (const role of roles) {
    await prisma.role.upsert({
      where:  { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log(`   ✅ ${roles.length} role tersimpan.\n`);

  // --------------------------------------------------------
  // 3. MAPPING ROLE ↔ PERMISSION
  // --------------------------------------------------------
  const rolePermissionMap: Record<string, string[]> = {
    SUPERADMIN: [
      // Domain klinik
      "PASIEN_CREATE", "PASIEN_READ_ALL", "PASIEN_READ_OWN", "PASIEN_UPDATE", "PASIEN_DELETE",
      "REKAM_CREATE", "REKAM_READ_ALL", "REKAM_READ_OWN", "REKAM_UPDATE",
      "JADWAL_MANAGE", "JADWAL_READ",
      "ANTRIAN_CREATE", "ANTRIAN_MANAGE", "ANTRIAN_READ",
      "PEMBAYARAN_CREATE", "PEMBAYARAN_READ",
      // User management lama
      "USER_MANAGE", "ROLE_ASSIGN",
      // User management granular (FIX A2)
      "USER_ALL", "USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "USER_ASSIGN_ROLE",
    ],
    DOKTER: [
      "PASIEN_READ_ALL", "PASIEN_READ_OWN",
      "REKAM_CREATE", "REKAM_READ_ALL", "REKAM_UPDATE",
      "JADWAL_MANAGE", "JADWAL_READ",
      "ANTRIAN_READ",
    ],
    PERAWAT: [
      "PASIEN_CREATE", "PASIEN_READ_ALL", "PASIEN_UPDATE",
      "ANTRIAN_CREATE", "ANTRIAN_MANAGE", "ANTRIAN_READ",
      "JADWAL_READ",
      "REKAM_READ_ALL",
    ],
    KASIR: [
      "PEMBAYARAN_CREATE", "PEMBAYARAN_READ",
      "ANTRIAN_READ",
      "PASIEN_READ_ALL",
    ],
    PASIEN: [
      "PASIEN_READ_OWN",
      "REKAM_READ_OWN",
      "JADWAL_READ",
      "ANTRIAN_CREATE",
      "PEMBAYARAN_READ",
    ],
  };

  console.log("🔗 Menghubungkan role ↔ permission...");
  for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const permName of permNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
    console.log(`   ✅ ${roleName}: ${permNames.length} permission`);
  }

  // --------------------------------------------------------
  // 4. SEED SUPERADMIN
  // --------------------------------------------------------
  console.log("\n👤 Membuat akun Superadmin awal...");
  const hashedPassword = await Bun.password.hash("Admin@1234", {
    algorithm: "bcrypt",
    cost: 10,
  });

  const superadmin = await prisma.user.upsert({
    where:  { email: "admin@klinikcare.com" },
    update: {},
    create: {
      username: "superadmin",
      name:     "Super Administrator",
      email:    "admin@klinikcare.com",
      password: hashedPassword,
    },
  });

  const superadminRole = await prisma.role.findUnique({
    where: { name: "SUPERADMIN" },
  });
  if (superadminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: superadmin.id, roleId: superadminRole.id },
      },
      update: {},
      create: { userId: superadmin.id, roleId: superadminRole.id },
    });
  }

  console.log("   ✅ Superadmin berhasil dibuat.");
  console.log("   📧 Email   : admin@klinikcare.com");
  console.log("   🔑 Password: Admin@1234");
  console.log("\n🎉 Seeding selesai! Database KlinikCare siap digunakan.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });