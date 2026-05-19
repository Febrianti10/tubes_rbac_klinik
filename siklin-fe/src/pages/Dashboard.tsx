import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  Users,
  CalendarDays,
  ClipboardList,
  Activity,
  Clock,
  ChevronRight,
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
} from "lucide-react";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Menunggu: "bg-amber-50 text-amber-600 border border-amber-200",
    "Dalam Pemeriksaan": "bg-sky-50 text-sky-600 border border-sky-200",
    Selesai: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    Batal: "bg-red-50 text-red-500 border border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-500";
};

const Dashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pasien" | "antrian" | "riwayat">("pasien");

  const stats = [
    { title: "Pasien Hari Ini", value: 24, icon: <Users size={22} />, color: "from-sky-500 to-sky-400" },
    { title: "Antrian Aktif", value: 8, icon: <ClipboardList size={22} />, color: "from-violet-500 to-violet-400" },
    { title: "Jadwal Dokter", value: 5, icon: <CalendarDays size={22} />, color: "from-emerald-500 to-emerald-400" },
    { title: "Pemeriksaan Selesai", value: 17, icon: <Activity size={22} />, color: "from-orange-500 to-orange-400" },
  ];

  const daftarPasien = [
    { id: "P-001", nama: "Budi Santoso", usia: 34, poli: "Poli Umum", dokter: "Dr. Amanda", status: "Dalam Pemeriksaan" },
    { id: "P-002", nama: "Siti Rahayu", usia: 28, poli: "Poli Anak", dokter: "Dr. Rian", status: "Menunggu" },
    { id: "P-003", nama: "Ahmad Fauzi", usia: 52, poli: "Poli Gigi", dokter: "Dr. Lena", status: "Selesai" },
    { id: "P-004", nama: "Dewi Kartika", usia: 41, poli: "Poli Umum", dokter: "Dr. Amanda", status: "Menunggu" },
    { id: "P-005", nama: "Rudi Hermawan", usia: 19, poli: "Poli Anak", dokter: "Dr. Rian", status: "Batal" },
  ];

  const antrian = [
    { nomor: "A-001", nama: "Budi Santoso", poli: "Poli Umum", jam: "08:15", status: "Dalam Pemeriksaan", icon: <Stethoscope size={16} /> },
    { nomor: "A-002", nama: "Dewi Kartika", poli: "Poli Umum", jam: "08:30", status: "Menunggu", icon: <Stethoscope size={16} /> },
    { nomor: "B-001", nama: "Siti Rahayu", poli: "Poli Anak", jam: "09:00", status: "Menunggu", icon: <Baby size={16} /> },
    { nomor: "C-001", nama: "Mega Putri", poli: "Poli Gigi", jam: "09:15", status: "Menunggu", icon: <HeartPulse size={16} /> },
    { nomor: "A-003", nama: "Hendra Gunawan", poli: "Poli Umum", jam: "09:30", status: "Menunggu", icon: <Stethoscope size={16} /> },
    { nomor: "B-002", nama: "Aisyah Maulida", poli: "Poli Anak", jam: "10:00", status: "Menunggu", icon: <Baby size={16} /> },
    { nomor: "A-004", nama: "Wahyu Pratama", poli: "Poli Umum", jam: "10:30", status: "Menunggu", icon: <Stethoscope size={16} /> },
    { nomor: "C-002", nama: "Citra Dewi", poli: "Poli Gigi", jam: "11:00", status: "Menunggu", icon: <HeartPulse size={16} /> },
  ];

  const riwayat = [
    { tanggal: "15 Mei 2025", nama: "Budi Santoso", poli: "Poli Umum", dokter: "Dr. Amanda", diagnosis: "ISPA Ringan", tindakan: "Pemberian obat flu & vitamin" },
    { tanggal: "10 Mei 2025", nama: "Siti Rahayu", poli: "Poli Anak", dokter: "Dr. Rian", diagnosis: "Demam Berdarah Tipe A", tindakan: "Rawat jalan, observasi 3 hari" },
    { tanggal: "5 Mei 2025", nama: "Ahmad Fauzi", poli: "Poli Gigi", dokter: "Dr. Lena", diagnosis: "Karies Gigi G36", tindakan: "Penambalan komposit" },
    { tanggal: "28 Apr 2025", nama: "Dewi Kartika", poli: "Poli Umum", dokter: "Dr. Amanda", diagnosis: "Hipertensi Stadium I", tindakan: "Resep amlodipine 5mg" },
    { tanggal: "20 Apr 2025", nama: "Rudi Hermawan", poli: "Poli Anak", dokter: "Dr. Rian", diagnosis: "Rhinitis Alergi", tindakan: "Antihistamin & edukasi alergen" },
  ];

  const tabs = [
    { key: "pasien", label: "Daftar Pasien", icon: <Users size={15} /> },
    { key: "antrian", label: "Antrian Hari Ini", icon: <ClipboardList size={15} /> },
    { key: "riwayat", label: "Riwayat Kunjungan", icon: <Activity size={15} /> },
  ] as const;

  const filteredPasien = daftarPasien.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.poli.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAntrian = antrian.filter(
    (a) =>
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.poli.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRiwayat = riwayat.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.poli.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role={user?.role || "USER"} />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <Navbar userName={user?.nama || "Guest"} role={user?.role || "USER"} />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow duration-300"
            >
              <div
                className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                    {s.title}
                  </p>
                  <h3 className="text-3xl font-black mt-1 text-gray-800 tabular-nums">
                    {s.value}
                  </h3>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm`}
                >
                  {s.icon}
                </div>
              </div>
              <div className="mt-3 h-0.5 w-8 rounded-full bg-gradient-to-r from-slate-200 to-transparent" />
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">

          {/* Header: Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-slate-100">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(t.key); setSearch(""); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === t.key
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama / poli..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 border border-transparent focus:border-sky-300 focus:bg-white focus:outline-none transition-all w-56"
              />
            </div>
          </div>

          {/* Tab: Daftar Pasien */}
          {activeTab === "pasien" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-medium">ID</th>
                    <th className="text-left px-5 py-3 font-medium">Nama Pasien</th>
                    <th className="text-left px-5 py-3 font-medium">Usia</th>
                    <th className="text-left px-5 py-3 font-medium">Poli</th>
                    <th className="text-left px-5 py-3 font-medium">Dokter</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPasien.map((p, i) => (
                    <tr key={i} className="hover:bg-sky-50/40 transition-colors group cursor-pointer">
                      <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">{p.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {p.nama.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{p.nama}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{p.usia} th</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.poli}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.dokter}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPasien.length === 0 && (
                <p className="text-center py-10 text-gray-400 text-sm">Tidak ada data pasien.</p>
              )}
            </div>
          )}

          {/* Tab: Antrian */}
          {activeTab === "antrian" && (
            <div className="p-5">
              {/* Ringkasan per poli */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Poli Umum", count: antrian.filter((a) => a.poli === "Poli Umum").length, color: "bg-sky-500" },
                  { label: "Poli Anak", count: antrian.filter((a) => a.poli === "Poli Anak").length, color: "bg-violet-500" },
                  { label: "Poli Gigi", count: antrian.filter((a) => a.poli === "Poli Gigi").length, color: "bg-orange-400" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    <span className="text-sm text-gray-600">{p.label}</span>
                    <span className="ml-auto font-bold text-gray-800">{p.count}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                {filteredAntrian.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 border transition-all ${
                      a.status === "Dalam Pemeriksaan"
                        ? "bg-sky-50 border-sky-200"
                        : "bg-white border-slate-100 hover:border-sky-200"
                    }`}
                  >
                    <div
                      className={`w-14 text-center rounded-lg py-1.5 text-xs font-black tracking-wide ${
                        a.status === "Dalam Pemeriksaan"
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100 text-gray-500"
                      }`}
                    >
                      {a.nomor}
                    </div>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {a.nama.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{a.nama}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                        {a.icon}
                        <span>{a.poli}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                      <Clock size={13} />
                      {a.jam}
                    </div>

                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
                {filteredAntrian.length === 0 && (
                  <p className="text-center py-8 text-gray-400 text-sm">Tidak ada antrian.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Riwayat Kunjungan */}
          {activeTab === "riwayat" && (
            <div className="divide-y divide-slate-100">
              {filteredRiwayat.map((r, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-sky-400 ring-2 ring-sky-100" />
                    {i < filteredRiwayat.length - 1 && (
                      <div className="flex-1 w-px bg-slate-200 my-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                            {r.nama.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{r.nama}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-9">{r.poli} · {r.dokter}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                        {r.tanggal}
                      </span>
                    </div>

                    <div className="mt-3 ml-9 grid sm:grid-cols-2 gap-2">
                      <div className="bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2.5">
                        <p className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-0.5">Diagnosis</p>
                        <p className="text-sm text-gray-700">{r.diagnosis}</p>
                      </div>
                      <div className="bg-sky-50 border border-sky-100 rounded-xl px-3.5 py-2.5">
                        <p className="text-xs font-medium text-sky-500 uppercase tracking-wide mb-0.5">Tindakan</p>
                        <p className="text-sm text-gray-700">{r.tindakan}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRiwayat.length === 0 && (
                <p className="text-center py-10 text-gray-400 text-sm">Tidak ada riwayat kunjungan.</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              {activeTab === "pasien" && `${filteredPasien.length} pasien`}
              {activeTab === "antrian" && `${filteredAntrian.length} antrian`}
              {activeTab === "riwayat" && `${filteredRiwayat.length} kunjungan`}
            </span>
            <button className="flex items-center gap-1 text-sky-600 font-medium hover:text-sky-700 transition-colors">
              Lihat semua <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;