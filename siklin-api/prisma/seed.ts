import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Admin@1234";

const permissions = [
  { name: "PASIEN_CREATE", description: "Mendaftarkan pasien baru" },
  { name: "PASIEN_READ_ALL", description: "Melihat semua data pasien" },
  { name: "PASIEN_READ_OWN", description: "Melihat data diri sendiri" },
  { name: "PASIEN_UPDATE", description: "Mengubah data pasien" },
  { name: "PASIEN_DELETE", description: "Menghapus data pasien" },
  { name: "REKAM_CREATE", description: "Membuat rekam medis baru" },
  { name: "REKAM_READ_ALL", description: "Membaca semua rekam medis" },
  { name: "REKAM_READ_OWN", description: "Membaca rekam medis milik sendiri" },
  { name: "REKAM_UPDATE", description: "Mengubah rekam medis" },
  { name: "JADWAL_MANAGE", description: "Membuat dan mengubah jadwal praktik" },
  { name: "JADWAL_READ", description: "Melihat jadwal praktik dokter" },
  { name: "ANTRIAN_CREATE", description: "Mendaftarkan antrian pasien" },
  { name: "ANTRIAN_MANAGE", description: "Mengelola dan memanggil antrian" },
  { name: "ANTRIAN_READ", description: "Melihat daftar antrian" },
  { name: "PEMBAYARAN_CREATE", description: "Memproses pembayaran" },
  { name: "PEMBAYARAN_READ", description: "Melihat data pembayaran" },
  { name: "USER_MANAGE", description: "Mengelola akun pengguna (legacy)" },
  { name: "ROLE_ASSIGN", description: "Menetapkan role ke pengguna (legacy)" },
  { name: "USER_ALL", description: "Melihat semua akun pengguna" },
  { name: "USER_READ", description: "Melihat detail akun pengguna" },
  { name: "USER_CREATE", description: "Membuat akun pengguna baru" },
  { name: "USER_UPDATE", description: "Mengubah data akun pengguna" },
  { name: "USER_DELETE", description: "Menghapus akun pengguna" },
  { name: "USER_ASSIGN_ROLE", description: "Menetapkan role ke pengguna" },
  { name: "ROLE_READ", description: "Melihat daftar role" },
  { name: "ROLE_CREATE", description: "Membuat role baru" },
  { name: "ROLE_UPDATE", description: "Mengubah role" },
  { name: "ROLE_DELETE", description: "Menghapus role" },
  { name: "ROLE_ASSIGN_PERMISSION", description: "Menetapkan permission ke role" },
];

const roles = [
  { name: "SUPERADMIN", description: "Administrator penuh, akses semua fitur" },
  { name: "DOKTER", description: "Dokter praktik, akses rekam medis dan jadwal" },
  { name: "PERAWAT", description: "Perawat, akses pendaftaran dan antrian" },
  { name: "KASIR", description: "Kasir, akses pembayaran" },
  { name: "PASIEN", description: "Pasien terdaftar, akses data sendiri" },
];

const rolePermissionMap: Record<string, string[]> = {
  SUPERADMIN: permissions.map((permission) => permission.name),
  DOKTER: [
    "PASIEN_READ_ALL",
    "PASIEN_READ_OWN",
    "REKAM_CREATE",
    "REKAM_READ_ALL",
    "REKAM_UPDATE",
    "JADWAL_MANAGE",
    "JADWAL_READ",
    "ANTRIAN_READ",
  ],
  PERAWAT: [
    "PASIEN_CREATE",
    "PASIEN_READ_ALL",
    "PASIEN_UPDATE",
    "ANTRIAN_CREATE",
    "ANTRIAN_MANAGE",
    "ANTRIAN_READ",
    "JADWAL_READ",
    "REKAM_READ_ALL",
  ],
  KASIR: [
    "PASIEN_READ_ALL",
    "ANTRIAN_READ",
    "PEMBAYARAN_CREATE",
    "PEMBAYARAN_READ",
  ],
  PASIEN: [
    "PASIEN_READ_OWN",
    "REKAM_READ_OWN",
    "JADWAL_READ",
    "ANTRIAN_CREATE",
    "PEMBAYARAN_READ",
  ],
};

const demoUsers = [
  {
    key: "superadmin",
    username: "superadmin",
    email: "admin@klinikcare.com",
    name: "Super Admin Klinik",
    role: "SUPERADMIN",
  },
  {
    key: "dokter1",
    username: "dokter1",
    email: "dokter1@klinikcare.com",
    name: "dr. Andi Pratama",
    role: "DOKTER",
  },
  {
    key: "dokter2",
    username: "dokter2",
    email: "dokter2@klinikcare.com",
    name: "dr. Maya Lestari",
    role: "DOKTER",
  },
  {
    key: "perawat1",
    username: "perawat1",
    email: "perawat1@klinikcare.com",
    name: "Siti Lestari",
    role: "PERAWAT",
  },
  {
    key: "perawat2",
    username: "perawat2",
    email: "perawat2@klinikcare.com",
    name: "Nur Aini",
    role: "PERAWAT",
  },
  {
    key: "kasir1",
    username: "kasir1",
    email: "kasir1@klinikcare.com",
    name: "Budi Santoso",
    role: "KASIR",
  },
  {
    key: "kasir2",
    username: "kasir2",
    email: "kasir2@klinikcare.com",
    name: "Rudi Hartono",
    role: "KASIR",
  },
  {
    key: "pasien1",
    username: "pasien1",
    email: "pasien1@klinikcare.com",
    name: "Rina Amelia",
    role: "PASIEN",
  },
  {
    key: "pasien2",
    username: "pasien2",
    email: "pasien2@klinikcare.com",
    name: "Doni Saputra",
    role: "PASIEN",
  },
  {
    key: "pasien3",
    username: "pasien3",
    email: "pasien3@klinikcare.com",
    name: "Lina Oktavia",
    role: "PASIEN",
  },
];

async function resetDomainData() {
  console.log("Reset seluruh data demo lama...");
  await prisma.rekamMedis.deleteMany({});
  await prisma.pembayaran.deleteMany({});
  await prisma.antrian.deleteMany({});
  await prisma.jadwal.deleteMany({});
  await prisma.pasien.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
}

async function seedPermissionsAndRoles() {
  console.log("Menyimpan permissions...");
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
    });
  }

  console.log("Menyimpan roles...");
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log("Sinkron role dan permission...");
  for (const [roleName, permissionNames] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });
      if (!permission) continue;

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}

async function seedUsers() {
  console.log("Menyimpan akun demo...");
  const hashedPassword = await Bun.password.hash(DEMO_PASSWORD, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const createdUsers: Record<string, { id: string; username: string }> = {};

  for (const item of demoUsers) {
    const role = await prisma.role.findUnique({ where: { name: item.role } });
    if (!role) {
      throw new Error(`Role ${item.role} tidak ditemukan.`);
    }

    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        username: item.username,
        name: item.name,
        password: hashedPassword,
      },
      create: {
        username: item.username,
        name: item.name,
        email: item.email,
        password: hashedPassword,
      },
    });

    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    createdUsers[item.key] = { id: user.id, username: user.username };
  }

  return createdUsers;
}

function requireUser(
  users: Record<string, { id: string; username: string }>,
  key: string,
) {
  const user = users[key];
  if (!user) {
    throw new Error(`User demo ${key} tidak ditemukan setelah proses seed.`);
  }
  return user;
}

async function seedPasien(users: Record<string, { id: string }>) {
  console.log("Menyimpan data pasien...");
  const pasien1User = requireUser(users as Record<string, { id: string; username: string }>, "pasien1");
  const pasien2User = requireUser(users as Record<string, { id: string; username: string }>, "pasien2");
  const pasien3User = requireUser(users as Record<string, { id: string; username: string }>, "pasien3");

  const pasien1 = await prisma.pasien.create({
    data: {
      noRM: "RM-0001",
      nama: "Rina Amelia",
      tglLahir: new Date("1998-02-12"),
      jenisKelamin: "PEREMPUAN",
      alamat: "Jl. Melati No. 10, Bandung",
      noTelp: "081234567890",
      userId: pasien1User.id,
    },
  });

  const pasien2 = await prisma.pasien.create({
    data: {
      noRM: "RM-0002",
      nama: "Doni Saputra",
      tglLahir: new Date("1995-09-20"),
      jenisKelamin: "LAKI_LAKI",
      alamat: "Jl. Kenanga No. 22, Cimahi",
      noTelp: "081298765432",
      userId: pasien2User.id,
    },
  });

  const pasien3 = await prisma.pasien.create({
    data: {
      noRM: "RM-0003",
      nama: "Lina Oktavia",
      tglLahir: new Date("2001-07-05"),
      jenisKelamin: "PEREMPUAN",
      alamat: "Jl. Mawar No. 18, Bandung",
      noTelp: "081355577799",
      userId: pasien3User.id,
    },
  });

  return { pasien1, pasien2, pasien3 };
}

async function seedJadwal(users: Record<string, { id: string }>) {
  console.log("Menyimpan jadwal dokter...");
  const dokter1 = requireUser(users as Record<string, { id: string; username: string }>, "dokter1");
  const dokter2 = requireUser(users as Record<string, { id: string; username: string }>, "dokter2");
  const jadwalSenin = await prisma.jadwal.create({
    data: {
      hari: "Senin",
      jamMulai: "08:00",
      jamSelesai: "11:00",
      kuota: 20,
      dokterId: dokter1.id,
    },
  });
  const jadwalSelasa = await prisma.jadwal.create({
    data: {
      hari: "Selasa",
      jamMulai: "09:00",
      jamSelesai: "12:00",
      kuota: 18,
      dokterId: dokter2.id,
    },
  });
  const jadwalRabu = await prisma.jadwal.create({
    data: {
      hari: "Rabu",
      jamMulai: "13:00",
      jamSelesai: "16:00",
      kuota: 15,
      dokterId: dokter1.id,
    },
  });
  const jadwalKamis = await prisma.jadwal.create({
    data: {
      hari: "Kamis",
      jamMulai: "10:00",
      jamSelesai: "14:00",
      kuota: 12,
      dokterId: dokter2.id,
    },
  });

  return {
    jadwalSenin,
    jadwalSelasa,
    jadwalRabu,
    jadwalKamis,
  };
}

async function seedAntrianAndRelatedData(
  users: Record<string, { id: string }>,
  pasien: Awaited<ReturnType<typeof seedPasien>>,
  jadwal: Awaited<ReturnType<typeof seedJadwal>>,
) {
  console.log("Menyimpan antrian, rekam medis, dan pembayaran...");
  const dokter1 = requireUser(users as Record<string, { id: string; username: string }>, "dokter1");
  const dokter2 = requireUser(users as Record<string, { id: string; username: string }>, "dokter2");
  const kasir1 = requireUser(users as Record<string, { id: string; username: string }>, "kasir1");

  const antrianMenunggu = await prisma.antrian.create({
    data: {
      nomorAntrian: 1,
      status: "MENUNGGU",
      tglDaftar: new Date(),
      pasienId: pasien.pasien1.id,
      jadwalId: jadwal.jadwalSenin.id,
    },
  });

  const antrianDiperiksa = await prisma.antrian.create({
    data: {
      nomorAntrian: 2,
      status: "DIPERIKSA",
      tglDaftar: new Date(),
      pasienId: pasien.pasien3.id,
      jadwalId: jadwal.jadwalSelasa.id,
    },
  });

  const antrianSelesaiBelumBayar = await prisma.antrian.create({
    data: {
      nomorAntrian: 3,
      status: "SELESAI",
      tglDaftar: new Date(),
      pasienId: pasien.pasien2.id,
      jadwalId: jadwal.jadwalRabu.id,
    },
  });

  const antrianSelesaiLunas = await prisma.antrian.create({
    data: {
      nomorAntrian: 4,
      status: "SELESAI",
      tglDaftar: new Date(),
      pasienId: pasien.pasien1.id,
      jadwalId: jadwal.jadwalKamis.id,
    },
  });

  await prisma.rekamMedis.createMany({
    data: [
      {
        pasienId: pasien.pasien3.id,
        dokterId: dokter2.id,
        antrianId: antrianDiperiksa.id,
        keluhan: "Pusing, mual, dan lemas sejak pagi.",
        diagnosa: "Vertigo ringan dan kelelahan.",
        resep: "Betahistine 2x1, istirahat cukup, banyak minum air.",
      },
      {
        pasienId: pasien.pasien2.id,
        dokterId: dokter1.id,
        antrianId: antrianSelesaiBelumBayar.id,
        keluhan: "Demam dan batuk sejak 3 hari.",
        diagnosa: "ISPA ringan.",
        resep: "Paracetamol 3x1, OBH 3x1, vitamin C.",
      },
      {
        pasienId: pasien.pasien1.id,
        dokterId: dokter2.id,
        antrianId: antrianSelesaiLunas.id,
        keluhan: "Nyeri lambung setelah telat makan.",
        diagnosa: "Gastritis akut.",
        resep: "Antasida 3x1 sebelum makan, omeprazole 1x1.",
      },
    ],
  });

  await prisma.pembayaran.createMany({
    data: [
      {
        antrianId: antrianSelesaiBelumBayar.id,
        jumlah: 125000,
        status: "BELUM_BAYAR",
      },
      {
        antrianId: antrianDiperiksa.id,
        jumlah: 90000,
        status: "BELUM_BAYAR",
      },
      {
        antrianId: antrianSelesaiLunas.id,
        jumlah: 185000,
        status: "LUNAS",
        metodeBayar: "QRIS",
        tglBayar: new Date(),
        kasirId: kasir1.id,
      },
    ],
  });

  return {
    antrianMenunggu,
    antrianDiperiksa,
    antrianSelesaiBelumBayar,
    antrianSelesaiLunas,
  };
}

async function main() {
  console.log("Memulai seeding Klinik RBAC...");

  await resetDomainData();
  await seedPermissionsAndRoles();
  const users = await seedUsers();
  const pasien = await seedPasien(users);
  const jadwal = await seedJadwal(users);
  await seedAntrianAndRelatedData(users, pasien, jadwal);

  console.log("");
  console.log("Semua akun demo memakai password:", DEMO_PASSWORD);
  console.log("SUPERADMIN : superadmin");
  console.log("DOKTER     : dokter1, dokter2");
  console.log("PERAWAT    : perawat1, perawat2");
  console.log("KASIR      : kasir1, kasir2");
  console.log("PASIEN     : pasien1, pasien2, pasien3");
  console.log("");
  console.log("Data demo yang siap diuji:");
  console.log("- 3 pasien terhubung ke akun pasien.");
  console.log("- 4 jadwal dokter aktif.");
  console.log("- 4 antrian dengan status MENUNGGU, DIPERIKSA, dan SELESAI.");
  console.log("- 3 rekam medis untuk pengujian dokter dan pasien.");
  console.log("- 3 pembayaran: 2 BELUM_BAYAR dan 1 LUNAS.");
  console.log("");
  console.log("Seeding selesai.");
}

main()
  .catch((error) => {
    console.error("Seeding gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
