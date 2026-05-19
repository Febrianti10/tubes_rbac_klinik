import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface JadwalItem {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  dokter?: { username?: string };
  _count?: { antrian: number };
  kuota: number;
}

interface AntrianItem {
  id: string;
  nomorAntrian: number;
  status: string;
  pasien?: { nama?: string; noRM?: string };
  jadwal?: { hari?: string; dokter?: { username?: string } };
  pembayaran?: { status?: string } | null;
  rekamMedis?: { id: string } | null;
}

const Antrian = () => {
  const { hasPermission } = useAuth();
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [antrianSaya, setAntrianSaya] = useState<AntrianItem[]>([]);
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [jadwalId, setJadwalId] = useState("");
  const [message, setMessage] = useState("");

  const canRead = hasPermission("ANTRIAN_READ");
  const canCreate = hasPermission("ANTRIAN_CREATE");
  const canManage = hasPermission("ANTRIAN_MANAGE");

  const fetchData = async () => {
    if (canRead) {
      const antrianRes = await api.get("/antrian");
      setAntrian(Array.isArray(antrianRes.data) ? antrianRes.data : antrianRes.data.data || []);
    }

    if (canCreate) {
      const myRes = await api.get("/antrian/saya");
      setAntrianSaya(myRes.data.data || []);
    }

    if (hasPermission("JADWAL_READ")) {
      const jadwalRes = await api.get("/jadwal");
      setJadwal(Array.isArray(jadwalRes.data) ? jadwalRes.data : jadwalRes.data.data || []);
    }
  };

  useEffect(() => {
    fetchData().catch(() => {
      setAntrian([]);
      setJadwal([]);
    });
  }, []);

  const daftarAntrian = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/antrian", { jadwalId });
    setMessage("Nomor antrian berhasil diambil.");
    setJadwalId("");
    await fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/antrian/${id}/status`, { status });
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Modul Antrian</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pasien dapat mengambil nomor antrian, sedangkan perawat atau admin dapat memantau dan mengubah statusnya.
        </p>
      </div>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      {canCreate ? (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Ambil antrian baru</h3>
          <form onSubmit={daftarAntrian} className="mt-5 flex flex-col gap-4 md:flex-row">
            <select
              value={jadwalId}
              onChange={(e) => setJadwalId(e.target.value)}
              required
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="">Pilih jadwal dokter</option>
              {jadwal.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.hari} | {item.jamMulai}-{item.jamSelesai} | {item.dokter?.username} | {item._count?.antrian || 0}/{item.kuota}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white">
              Ambil nomor
            </button>
          </form>
        </section>
      ) : null}

      {canCreate ? (
        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Riwayat antrian saya</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">No</th>
                  <th className="px-3 py-3">Dokter</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Tagihan</th>
                </tr>
              </thead>
              <tbody>
                {antrianSaya.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">#{item.nomorAntrian}</td>
                    <td className="px-3 py-3">{item.jadwal?.dokter?.username || "-"}</td>
                    <td className="px-3 py-3">{item.status}</td>
                    <td className="px-3 py-3">{item.pembayaran?.status || "Belum ada"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900">Daftar antrian hari ini</h3>
        {!canRead ? (
          <p className="mt-4 text-sm text-slate-500">Role ini tidak memiliki akses melihat seluruh antrian.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">No</th>
                  <th className="px-3 py-3">Pasien</th>
                  <th className="px-3 py-3">Jadwal</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {antrian.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold">#{item.nomorAntrian}</td>
                    <td className="px-3 py-3">{item.pasien?.nama || "-"}</td>
                    <td className="px-3 py-3">
                      {item.jadwal?.hari || "-"} / {item.jadwal?.dokter?.username || "-"}
                    </td>
                    <td className="px-3 py-3">{item.status}</td>
                    <td className="px-3 py-3">
                      {canManage ? (
                        <div className="flex gap-2">
                          {["MENUNGGU", "DIPERIKSA", "SELESAI"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateStatus(item.id, status)}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-xs"
                              disabled={status === "SELESAI" && !item.rekamMedis && !item.pembayaran}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">Lihat saja</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Antrian;
