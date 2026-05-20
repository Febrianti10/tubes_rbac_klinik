import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/pasien", label: "Daftar Pasien", permission: "PASIEN_READ_ALL" },
  { to: "/jadwal", label: "Jadwal", permission: "JADWAL_READ" },
  { to: "/antrian", label: "Antrian", permission: "ANTRIAN_READ" },
  
  // =========================================================================
  // 1. TUGAS REKAN ANDA (TETAP DIJAGA)
  // =========================================================================
  { to: "/riwayat-kunjungan", label: "Riwayat Kunjungan" },

  // =========================================================================
  // 2. TUGAS ANDA (MANDIRI - FORM REKAM MEDIS)
  // =========================================================================
  { to: "/rekam-medis", label: "Rekam Medis", oneOf: ["REKAM_READ_ALL", "REKAM_READ_OWN"] },

  { to: "/pembayaran", label: "Pembayaran", permission: "PEMBAYARAN_READ" },
  { to: "/users", label: "User", permission: "USER_ALL" },
];

const AppShell = () => {
  const { user, logout, hasPermission } = useAuth();

  const visibleNav = navItems.filter((item) => {
    if (!item.permission && !item.oneOf) return true;
    if (item.permission) return hasPermission(item.permission);
    return item.oneOf?.some(hasPermission);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sistem Klinik RBAC</h1>
            <p className="text-sm text-gray-500">
              Login sebagai {user?.name || user?.username} ({user?.roles.join(", ")})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-blue-600 hover:bg-blue-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;