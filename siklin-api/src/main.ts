import { cors } from "@elysiajs/cors";
import "dotenv/config";
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { jwt } from "@elysiajs/jwt";
import { permissionRoutes } from "./interface/http/permission.routes.ts";
import { roleRoutes } from "./interface/http/role.routes.ts";
import { userRoutes } from "./interface/http/user.routes.ts";
import { authRoutes } from "./interface/http/auth.routes.ts";
import { db } from "./infrastructure/database/prisma-client.ts";
import { healthHtmlTemplate } from "./infrastructure/views/health-template.ts";
import { pasienRoutes } from "./interface/http/pasien.routes.ts";
import { rekamMedisRoutes } from "./interface/http/rekammedis.routes.ts";
import { antrianRoutes } from "./interface/http/antrian.routes.ts";
import { jadwalRoutes } from "./interface/http/jadwal.routes.ts";
import { pembayaranRoutes } from "./interface/http/pembayaran.routes.ts";

// Ambil port dari .env atau gunakan 3000 sebagai default
const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "fallback_secret_jika_env_lupa_diset",
      exp: process.env.JWT_EXP || "1d",
    }),
  )
  .use(html()) // Aktifkan dukungan HTML

  // --- HEALTH CHECK & LANDING PAGE ---
.get("/", async ({ headers }: { headers: Record<string, string | undefined> }) => {
    let dbStatus = "Connected";
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "Disconnected";
    }

    const uptimeSeconds = process.uptime();
    const data = {
      status: "Online",
      database: dbStatus,
      uptime: `${(uptimeSeconds / 60).toFixed(2)} Minutes`,
      uptime_raw: uptimeSeconds, // Data mentah untuk front-end
      timestamp: new Date().toISOString(),
      timestamp_formatted: new Date().toLocaleString('id-ID')
    };

    // CEK REQUEST: Jika header 'Accept' meminta JSON, kirim JSON mentah.
    // Ini biasanya dipanggil oleh Front-end via fetch() atau Axios.
    if (headers['accept']?.includes('application/json')) {
      return data;
    }

    // DEFAULT: Jika dibuka langsung lewat Browser, kirim Dashboard HTML.
    return healthHtmlTemplate({
      status: data.status,
      database: data.database,
      uptime: data.uptime,
      timestamp: data.timestamp_formatted
    });
  })

  .group("/api/v1", (app) =>
    app
      .use(authRoutes)
      .use(permissionRoutes)
      .use(roleRoutes)
      .use(userRoutes)
      .use(pasienRoutes)
      .use(rekamMedisRoutes)
      .use(antrianRoutes)
      .use(jadwalRoutes)
      .use(pembayaranRoutes)
);
app.routes.forEach(route => {
    console.log(`${route.method} ${route.path}`);
});

// --- LISTEN ---
app.listen(PORT);

console.log(`\n🦊 Elysia Research Mode is active!`);
console.log(
  `🚀 Server running at: http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `🔗 Health Check: http://${app.server?.hostname}:${app.server?.port}/`,
);
