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
├── prisma/
│ ├── schema.prisma # Skema 10 tabel (A1 - Feby)
│ └── seed.ts # Seed role, permission, superadmin (A1 - Feby)
├── src/
│ ├── application/
│ │ └── usecases/ # CheckPermission, AssignRole (A2 - Aisyah)
│ ├── domain/
│ │ └── repositories/ # Interface kontrak repository
│ ├── infrastructure/
│ │ ├── database/
│ │ │ └── prisma-client.ts # Singleton Prisma Client (A1 - Feby)
│ │ └── repositories/ # Implementasi Prisma
│ └── interface/
│ ├── http/ # Routes Elysia (A2, A3)
│ └── middleware/ # RBAC Middleware (A3 - Rizma)
├── .env # Konfigurasi lokal (tidak di-push ke Git)
├── .env.example # Template konfigurasi
├── package.json
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
