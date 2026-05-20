import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Antrian = () => {
  const { hasPermission, user } = useAuth();
  
  // State untuk menampung data dari database MySQL
  const [daftarJadwal, setDaftarJadwal] = useState<any[]>([]);
  const [daftarAntrianHariIni, setDaftarAntrianHariIni] = useState<any[]>([]);
  const [riwayatAntrianSaya, setRiwayatAntrianSaya] = useState<any[]>([]);
  
  // State untuk form input
  const [jadwalId, setJadwalId] = useState("");
  const [loading, setLoading] = useState(false);

  // Pengecekan Role & Permission berbasis RBAC tim Anda
  const isSuperAdmin = user?.role === "SUPERADMIN" || (user as any)?.roles?.includes("SUPERADMIN");
  const canReadAntrian = hasPermission("ANTRIAN_READ") || isSuperAdmin;
  const canCreateAntrian = hasPermission("ANTRIAN_CREATE") || isSuperAdmin;

  // Fungsi mengambil data terintegrasi dari backend API
  const fetchData = async () => {
    try {
      // 1. Ambil data jadwal dokter untuk dropdown "Ambil Antrian Baru"
      if (canCreateAntrian) {
        const jadwalRes = await api.get("/jadwal");
        let dataJadwal = jadwalRes.data;
        if (dataJadwal && dataJadwal.data) dataJadwal = dataJadwal.data; // Unpack Elysia.js
        setDaftarJadwal(Array.isArray(dataJadwal) ? dataJadwal : []);
      }

      // 2. Ambil data seluruh antrian untuk tabel bawah
      if (canReadAntrian) {
        const antrianRes = await api.get("/antrian");
        let dataAntrian = antrianRes.data;
        if (dataAntrian && dataAntrian.data) dataAntrian = dataAntrian.data; // Unpack Elysia.js
        
        const arrayAntrian = Array.isArray(dataAntrian) ? dataAntrian : [];
        setDaftarAntrianHariIni(arrayAntrian);

        // 3. Filter data khusus untuk tabel "Riwayat antrian saya" jika user login adalah pasien biasa
        if (user?.id) {
          const milikSaya = arrayAntrian.filter((item: any) => item.pasienId === user.id || item.userId === user.id);
          setRiwayatAntrianSaya(milikSaya);
        }
      }
    } catch (error) {
      console.error("Gagal memuat data antrian klinik:", error);
    }
  };

  useEffect(() => {
    fetchData().catch(() => {});
  }, []);

  // Fungsi submit data antrian baru ke database
  const handleAmbilAntrian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalId) {
      alert("Silakan pilih jadwal dokter terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/antrian", { 
        jadwalId: jadwalId 
      });

      if (response.status === 200 || response.status === 201) {
        alert("Nomor antrian berhasil diambil!");
        setJadwalId(""); // Reset dropdown pilihan
        await fetchData(); // Sinkronisasi ulang data tabel agar langsung muncul
      }
    } catch (err: any) {
      console.error("Error ambil antrian:", err);
      alert(err.response?.data?.message || "Gagal membuat nomor antrian baru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Modul Antrian</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pasien dapat mengambil nomor antrian, sedangkan perawat atau admin dapat memantau dan mengubah statusnya.
        </p>
      </div>

      {/* 1. FORM AMBIL ANTRIAN BARU */}
      {canCreateAntrian && (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Ambil antrian baru</h3>
          <form onSubmit={handleAmbilAntrian} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pilih jadwal dokter
              </label>
              <select
                value={jadwalId}
                onChange={(e) => setJadwalId(e.target.value)}
                required
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih jadwal dokter --</option>
                {daftarJadwal.map((item: any) => {
                  // Fallback pertahanan nama dokter dan format waktu database
                  const namaDokter = item.dokter?.nama || item.dokter?.name || item.dokter1 || item.dokter2 || "Dokter Klinik";
                  const jamPraktik = item.jamMulai && item.jamSelesai ? `(${item.jamMulai} - ${item.jamSelesai})` : "(08:00 - 11:00)";
                  return (
                    <option key={item.id} value={item.id}>
                      {namaDokter} — {item.hari || "Hari Aktif"} {jamPraktik}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition text-sm disabled:bg-blue-400 h-[46px]"
            >
              {loading ? "Memproses..." : "Ambil nomor"}
            </button>
          </form>
        </section>
      )}

      {/* 2. TABEL RIWAYAT ANTRIAN SAYA */}
      <section className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">Riwayat antrian saya</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-slate-500 font-medium bg-slate-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">No</th>
                <th className="px-4 py-3">Dokter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-xl">Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {riwayatAntrianSaya.length > 0 ? (
                riwayatAntrianSaya.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-4 font-medium text-slate-600">{idx + 1}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {item.jadwal?.dokter?.nama || item.jadwal?.dokter?.name || "Dokter Umum"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "SELESAI" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        item.status === "DIPERIKSA" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {item.status || "MENUNGGU"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium">
                      {item.tagihan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400">
                    Belum ada riwayat antrian pribadi Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. TABEL DAFTAR ANTRIAN HARI INI */}
      {canReadAntrian && (
        <section className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Daftar antrian hari ini</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-slate-500 font-medium bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">No</th>
                  <th className="px-4 py-3">Pasien</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {daftarAntrianHariIni.length > 0 ? (
                  daftarAntrianHariIni.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-4 font-medium text-slate-600">
                        {item.nomorAntrian || idx + 1}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {item.pasien?.nama || item.pasien?.name || "Pasien Umum"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.jadwal?.dokter?.nama || "Dokter"} — {item.jadwal?.hari || "Hari Praktik"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "SELESAI" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          item.status === "DIPERIKSA" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {item.status || "MENUNGGU"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-400 font-medium">—</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      Tidak ada antrian klinik yang terdaftar hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Antrian;