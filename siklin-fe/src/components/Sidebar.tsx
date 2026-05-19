import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  CreditCard,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface SidebarProps {
  role: string;
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();

  const menuByRole: Record<string, any[]> = {
    SUPERADMIN: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Kelola User",
        path: "/users",
        icon: <ShieldCheck size={20} />,
      },
      {
        name: "Data Pasien",
        path: "/pasien",
        icon: <Users size={20} />,
      },
      {
        name: "Jadwal Dokter",
        path: "/jadwal",
        icon: <CalendarDays size={20} />,
      },
      {
        name: "Rekam Medis",
        path: "/rekam-medis",
        icon: <FileText size={20} />,
      },
      {
        name: "Pembayaran",
        path: "/pembayaran",
        icon: <CreditCard size={20} />,
      },
    ],

    DOKTER: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Rekam Medis",
        path: "/rekam-medis",
        icon: <ClipboardList size={20} />,
      },
      {
        name: "Jadwal Saya",
        path: "/jadwal",
        icon: <CalendarDays size={20} />,
      },
    ],

    PERAWAT: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Data Pasien",
        path: "/pasien",
        icon: <Users size={20} />,
      },
      {
        name: "Antrian",
        path: "/antrian",
        icon: <ClipboardList size={20} />,
      },
    ],
      KASIR: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Pembayaran",
        path: "/pembayaran",
        icon: <CreditCard size={20} />,
      },
    ],

    PASIEN: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Jadwal Dokter",
        path: "/jadwal",
        icon: <CalendarDays size={20} />,
      },
      {
        name: "Riwayat Kunjungan",
        path: "/riwayat",
        icon: <FileText size={20} />,
      },
    ],
  };
  const menus = menuByRole[role] || [];

  return (
    <aside className="w-64 min-h-screen bg-sky-700 text-white shadow-lg">
      <div className="p-6 border-b border-sky-500">
        <h1 className="text-2xl font-bold">KlinikCare</h1>
        <p className="text-sm text-sky-100 mt-1">RBAC System</p>
      </div>

      <nav className="p-4 space-y-2">
        {menus.map((menu) => {
          const active = location.pathname === menu.path;

          return (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-white text-sky-700 font-semibold"
                  : "hover:bg-sky-600"
              }`}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </Link>
          );
                  })}
      </nav>
    </aside>
  );
};

export default Sidebar;