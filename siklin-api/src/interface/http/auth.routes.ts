import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { PrismaUserRepository } from "../../infrastructure/repositories/prisma-user.repository";
import { LoginUseCase } from "../../application/usecases/auth/login.usecase";
import { RegisterUserUseCase } from "../../application/usecases/user/register-user.usecase";

const userRepo = new PrismaUserRepository();
const loginUseCase = new LoginUseCase(userRepo);
const registerUseCase = new RegisterUserUseCase(userRepo); // ← tambahan A2

export const authRoutes = new Elysia({ prefix: "/auth" })
  // Konfigurasi JWT (dipakai oleh login untuk sign token)
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "fallback_secret_jika_env_lupa_diset",
      exp: process.env.JWT_EXP || "1d",
    })
  )

  // ----------------------------------------------------------------
  // POST /auth/register  — PUBLIK, tidak butuh token
  // Siapa pun bisa mendaftar akun baru dari endpoint ini.
  // ----------------------------------------------------------------
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const newUser = await registerUseCase.execute(body);

        // Hilangkan password dari response
        const { password, ...safeUser } = newUser as any;

        set.status = 201;
        return {
          message: "Registrasi berhasil. Silakan login untuk mendapatkan token.",
          data: safeUser,
        };
      } catch (e: any) {
        set.status = 400;
        return { error: e.message };
      }
    },
    {
      // Validasi tipe dari Elysia (lapisan pertama sebelum Joi di use case)
      body: t.Object({
        username: t.String({ minLength: 3 }),
        name: t.Optional(t.String({ minLength: 3 })),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        roleIds: t.Array(t.String()),
      }),
    }
  )

  // ----------------------------------------------------------------
  // POST /auth/login  — PUBLIK, tidak butuh token
  // Mengembalikan accessToken JWT yang berisi id, roles, permissions.
  // ----------------------------------------------------------------
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        // 1. Jalankan logika login (validasi + verifikasi password)
        const userPayload = await loginUseCase.execute(body);

        // 2. Generate Token JWT — payload sudah berisi roles & permissions
        const token = await jwt.sign(userPayload as any);

        // 3. Kembalikan token dan data user (tanpa password)
        return {
          message: "Login berhasil",
          accessToken: token,
          user: userPayload,
        };
      } catch (e: any) {
        set.status = 401;
        return { error: e.message };
      }
    }
  );
