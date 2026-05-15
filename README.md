# KlinikCare RBAC — Sistem Manajemen Klinik

Sistem Informasi Klinik berbasis Role-Based Access Control (RBAC) menggunakan Clean Architecture.  
**Mata Kuliah:** Pemrograman Web Lanjut  
**Dosen:** Syahru Rahmayuda, M.Kom

---

## 👥 Tim Pengembang

### Backend

| Anggota | Role              | Tugas                         |
| ------- | ----------------- | ----------------------------- |
| Feby    | Backend Lead (A1) | Database, Schema Prisma, Seed |
| Aisyah  | Backend (A2)      | Auth, JWT, Use Case RBAC      |
| Rizma   | Backend (A3)      | API Domain Klinik, Middleware |

### Frontend

| Anggota | Role               | Tugas                             |
| ------- | ------------------ | --------------------------------- |
| Tiko    | Frontend Lead (A4) | Setup React, Auth UI, AuthContext |
| Imel    | Frontend (A5)      | Dashboard, Sidebar, Layout        |
| Tesa       | Frontend (A6)      | Pendaftaran & Antrian Pasien      |
| Evelyn       | Frontend (A7)      | Rekam Medis & Jadwal Dokter       |
| Ghina   | Frontend (A8)      | Kasir, Route Guard, Halaman 403   |

---

## ⚙️ Tech Stack

### Backend

- **Runtime:** Bun v1.3.8
- **Framework:** Elysia.js
- **ORM:** Prisma v6
- **Database:** MySQL
- **Auth:** JWT + Bcrypt (Bun.password)
- **Validasi:** Joi

### Frontend

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

---

## 🗄️ Struktur Database (10 Tabel)

### Layer RBAC (5 Tabel)

| Tabel            | Fungsi                                                      |
| ---------------- | ----------------------------------------------------------- |
| `User`           | Akun semua pengguna sistem                                  |
| `Role`           | Peran pengguna (SUPERADMIN, DOKTER, PERAWAT, KASIR, PASIEN) |
| `Permission`     | Hak akses spesifik (18 permission)                          |
| `UserRole`       | Pivot many-to-many User ↔ Role                              |
| `RolePermission` | Pivot many-to-many Role ↔ Permission                        |

### Layer Domain Klinik (5 Tabel)

| Tabel        | Fungsi                          |
| ------------ | ------------------------------- |
| `Pasien`     | Data pasien terdaftar           |
| `RekamMedis` | Rekam medis per kunjungan       |
| `Jadwal`     | Jadwal praktik dokter           |
| `Antrian`    | Antrian pasien per jadwal       |
| `Pembayaran` | Transaksi pembayaran oleh kasir |

---

## 🔐 Role & Permission

| Permission        | SUPERADMIN | DOKTER | PERAWAT | KASIR | PASIEN |
| ----------------- | ---------- | ------ | ------- | ----- | ------ |
| PASIEN_CREATE     | ✅         | ❌     | ✅      | ❌    | ❌     |
| PASIEN_READ_ALL   | ✅         | ✅     | ✅      | ✅    | ❌     |
| PASIEN_READ_OWN   | ✅         | ✅     | ✅      | ❌    | ✅     |
| PASIEN_UPDATE     | ✅         | ❌     | ✅      | ❌    | ❌     |
| PASIEN_DELETE     | ✅         | ❌     | ❌      | ❌    | ❌     |
| REKAM_CREATE      | ✅         | ✅     | ❌      | ❌    | ❌     |
| REKAM_READ_ALL    | ✅         | ✅     | ✅      | ❌    | ❌     |
| REKAM_READ_OWN    | ✅         | ✅     | ❌      | ❌    | ✅     |
| REKAM_UPDATE      | ✅         | ✅     | ❌      | ❌    | ❌     |
| JADWAL_MANAGE     | ✅         | ✅     | ❌      | ❌    | ❌     |
| JADWAL_READ       | ✅         | ✅     | ✅      | ❌    | ✅     |
| ANTRIAN_CREATE    | ✅         | ❌     | ✅      | ❌    | ✅     |
| ANTRIAN_MANAGE    | ✅         | ❌     | ✅      | ❌    | ❌     |
| ANTRIAN_READ      | ✅         | ✅     | ✅      | ✅    | ❌     |
| PEMBAYARAN_CREATE | ✅         | ❌     | ❌      | ✅    | ❌     |
| PEMBAYARAN_READ   | ✅         | ❌     | ❌      | ✅    | ✅     |
| USER_MANAGE       | ✅         | ❌     | ❌      | ❌    | ❌     |
| ROLE_ASSIGN       | ✅         | ❌     | ❌      | ❌    | ❌     |

---

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone <repo-url>
cd tubes_rbac_klinik
bun install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Buka file `.env`, sesuaikan dengan konfigurasi MySQL lokal kamu:

```env
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/klinikcare_db"
```

### 3. Buat Database

Buka phpMyAdmin atau HeidiSQL, jalankan:

```sql
CREATE DATABASE IF NOT EXISTS klinikcare_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 4. Migrasi Database

```bash
bunx prisma migrate dev --name init_klinikcare
```

### 5. Seed Data

```bash
bunx prisma db seed
```

### 6. Jalankan Server

```bash
bun dev
```

### 7. (Opsional) Cek Database via Prisma Studio

```bash
bunx prisma studio
```

Buka browser: `http://localhost:5555`

---

## 🔑 Akun Default (Hasil Seed)

| Email                | Password   | Role       |
| -------------------- | ---------- | ---------- |
| admin@klinikcare.com | Admin@1234 | SUPERADMIN |

---

## 📁 Struktur Folder

tubes_rbac_klinik/
├── siklin-api/                         ← Backend (Bun + Prisma + Elysia)
│   ├── prisma/
│   │   ├── schema.prisma               ← Schema database RBAC & klinik (A1)
│   │   └── seed.ts                     ← Seed role, permission, superadmin (A1)
│   │
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── User.ts             ← Entity User, Role, Permission (A1)
│   │   │   │   └── Klinik.ts           ← Entity Pasien, RekamMedis, Jadwal (A1)
│   │   │   │
│   │   │   └── repositories/
│   │   │       ├── IUserRepository.ts      ← Contract repository user (A1)
│   │   │       └── IKlinikRepository.ts    ← Contract repository klinik (A1)
│   │   │
│   │   ├── application/
│   │   │   └── usecases/
│   │   │       ├── AuthUsecase.ts          ← Login & register user (A2)
│   │   │       ├── CheckPermission.ts      ← Cek permission user (A2)
│   │   │       └── AssignRoleToUser.ts     ← Assign/revoke role user (A2)
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   └── prisma-client.ts        ← Singleton Prisma Client (A1)
│   │   │   │
│   │   │   └── repositories/
│   │   │       ├── PrismaUserRepository.ts     ← Repository user Prisma (A2)
│   │   │       └── PrismaPasienRepository.ts   ← Repository pasien Prisma (A3)
│   │   │
│   │   ├── interfaces/
│   │   │   ├── middleware/
│   │   │   │   └── RBACMiddleware.ts      ← Middleware authenticate & authorize (A3)
│   │   │   │
│   │   │   └── http/
│   │   │       ├── auth.routes.ts         ← Endpoint login/register (A2)
│   │   │       ├── pasien.routes.ts       ← CRUD pasien (A3)
│   │   │       ├── rekammedis.routes.ts   ← Endpoint rekam medis (A3)
│   │   │       └── role.routes.ts         ← Endpoint role & permission (A3)
│   │   │
│   │   ├── config/
│   │   │   └── constants.ts               ← JWT_SECRET, PORT, ENV (A1)
│   │   │
│   │   └── main.ts                        ← Entry point server Elysia (A1)
│   │
│   ├── .env                               ← DATABASE_URL, JWT_SECRET
│   ├── package.json
│   └── README.md
│
├── siklin-fe/                             ← Frontend (React + Tailwind + Vite)
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx            ← Context authentication (A4)
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                     ← Axios instance & API config (A4)
│   │   │
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.tsx         ← Route guard berdasarkan role (A8)
│   │   │   └── AppRouter.tsx              ← Routing aplikasi (A4)
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                ← Sidebar dinamis berdasarkan role (A5)
│   │   │   ├── Navbar.tsx                 ← Navbar dashboard (A5)
│   │   │   ├── RoleAssign.tsx             ← Assign role user (A7)
│   │   │   ├── PermissionChecklist.tsx    ← Checklist permission (A7)
│   │   │   └── MedisForm.tsx              ← Form rekam medis (A7)
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx                  ← Halaman login (A4)
│   │   │   ├── Register.tsx               ← Halaman register (A4)
│   │   │   ├── Dashboard.tsx              ← Dashboard utama (A5)
│   │   │   ├── DaftarPasien.tsx           ← Pendaftaran pasien (A6)
│   │   │   ├── FormPasien.tsx             ← Form input pasien (A6)
│   │   │   ├── Antrian.tsx                ← Halaman antrian (A6)
│   │   │   ├── RiwayatKunjungan.tsx       ← Riwayat kunjungan pasien (A6)
│   │   │   ├── RekamMedis.tsx             ← Rekam medis dokter (A7)
│   │   │   ├── JadwalDokter.tsx           ← Jadwal praktik dokter (A7)
│   │   │   ├── Pembayaran.tsx             ← Pembayaran & kasir (A8)
│   │   │   └── Forbidden.tsx              ← Halaman 403 Forbidden (A8)
│   │   │
│   │   ├── .env
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── vite.config.ts
│   │
│   └── README.md
│
└── README.md

---

## 📌 Catatan untuk Tim

Setelah clone repository, wajib jalankan:

```bash
bun install
cp .env.example .env
bunx prisma migrate dev
bunx prisma db seed
```

Import Prisma Client di file manapun:

```typescript
import { db } from "../infrastructure/database/prisma-client";
```
