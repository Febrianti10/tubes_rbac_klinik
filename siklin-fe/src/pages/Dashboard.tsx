import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import {
  Users,
  CalendarDays,
  ClipboardList,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Pasien Hari Ini",
      value: 24,
      icon: <Users size={28} />,
    },
    {
      title: "Antrian Aktif",
      value: 8,
      icon: <ClipboardList size={28} />,
    },
    {
      title: "Jadwal Dokter",
      value: 5,
      icon: <CalendarDays size={28} />,
    },
    {
      title: "Pemeriksaan Selesai",
      value: 17,
      icon: <Activity size={28} />,
    },
  ];

  const jadwalHariIni = [
    {
      dokter: "Dr. Amanda",
      jam: "08:00 - 12:00",
      poli: "Poli Umum",
    },
    {
      dokter: "Dr. Rian",
      jam: "13:00 - 16:00",
      poli: "Poli Anak",
    },
  ];

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar role={user?.role || "USER"} />

      <main className="flex-1 p-6">
        <Navbar
          userName={user?.nama || "Guest"}
          role={user?.role || "USER"}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{item.title}</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-800">
                    {item.value}
                  </h3>
                </div>

                <div className="bg-sky-100 text-sky-700 p-4 rounded-xl">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Jadwal Dokter Hari Ini
            </h3>

            <div className="space-y-4">
              {jadwalHariIni.map((jadwal, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {jadwal.dokter}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {jadwal.poli}
                      </p>
                    </div>

                    <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {jadwal.jam}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Ringkasan Antrian
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Poli Umum</span>
                  <span className="font-semibold">12 Pasien</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-sky-600 h-3 rounded-full w-[70%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Poli Anak</span>
                  <span className="font-semibold">7 Pasien</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full w-[45%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Poli Gigi</span>
                  <span className="font-semibold">4 Pasien</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-orange-400 h-3 rounded-full w-[25%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;