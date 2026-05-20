import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface JadwalItem {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kuota: number;
  dokterId: string;
  dokter?: { username?: string };
  _count?: { antrian: number };
}

interface UserItem {
  id: string;
  username: string;
  roles?: any; // Dibuat 'any' agar fleksibel menerima bentuk data apa saja dari backend
  role?: any;
}

const emptyForm = {
  hari: "",
  jamMulai: "",
  jamSelesai: "",
  kuota: 20,
  dokterId: "",
};

const JadwalPage = () => {
  const { user, hasPermission, hasRole } = useAuth();
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [dokter, setDokter] = useState<UserItem[]>([]);
  const [form, setForm] = useState(emptyForm);

  const canRead = hasPermission("JADWAL_READ");
  const canManage = hasPermission("JADWAL_MANAGE");

  const fetchData = async () => {
    if (canRead) {
      try {
        const jadwalRes = await api.get("/jadwal");
        const jadwalData = Array.isArray(jadwalRes.data) ? jadwalRes.data : jadwalRes.data.data || [];
        setJadwal(jadwalData);
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);
      }
    }

    if (canManage && hasPermission("USER_ALL")) {
      try {
        const usersRes = await api.get("/users");
        
        // Membaca data users dengan aman
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];
        
        // 🚀 SUPER FILTER: Mencari dokter dengan berbagai kemungkinan bentuk data
        const dokterList = usersData.filter((item: UserItem) => {
          // Jika backend mengirimkan role langsung (bukan array)
          if (item.role) {
            if (typeof item.role === "string" && item.role.toUpperCase() === "DOKTER") return true;
            if (item.role.name && typeof item.role.name === "string" && item.role.name.toUpperCase() === "DOKTER") return true;
          }

          // Jika backend mengirimkan roles dalam bentuk array
          if (item.roles && Array.isArray(item.roles)) {
            return item.roles.some((r: any) => {
              if (typeof r === "string") return r.toUpperCase() === "DOKTER"; // Format: ["DOKTER"]
              if (r?.name && typeof r.name === "string") return r.name.toUpperCase() === "DOKTER"; // Format: [{ name: "Dokter" }]
              if (r?.role?.name && typeof r.role.name === "string") return r.role.name.toUpperCase() === "DOKTER"; // Format: [{ role: { name: "Dokter" } }]
              return false;
            });
          }

          return false;
        });
        
        setDokter(dokterList);
        
        // Otomatis pilih jika hanya ada 1 dokter
        if (dokterList.length === 1) {
          setForm((prev) => ({ ...prev, dokterId: dokterList[0].id }));
        }
      } catch (error) {
        console.error("Gagal mengambil data dokter:", error);
      }
    } else if (canManage && hasRole("DOKTER") && user?.id) {
      // Jika yang login adalah dokter, otomatis set ID dia sendiri
      setForm((prev) => ({ ...prev, dokterId: user.id }));
    }
  };

  useEffect(() => {
    fetchData().catch(() => {
      setJadwal([]);
      setDokter([]);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/jadwal", { ...form, kuota: Number(form.kuota) });
      setForm((prev) => ({ ...emptyForm, dokterId: prev.dokterId }));
      await fetchData();
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Jadwal Praktik</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pasien dapat melihat jadwal, sedangkan dokter dan admin dapat mengelola slot praktik.
        </p>
      </div>

      {canManage ? (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Form jadwal baru</h3>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={form.hari}
              onChange={(e) => setForm({ ...form, hari: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Hari (cth: Senin)"
              required
            />
            <input
              type="time"
              value={form.jamMulai}
              onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3"
              required
            />
            <input
              type="time"
              value={form.jamSelesai}
              onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3"
              required
            />
            <input
              type="number"
              min="1"
              value={form.kuota}
              onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
              className="rounded-2xl border border-slate-300 px-4 py-3"
              required
            />
            
            {hasPermission("USER_ALL") ? (
              <select
                value={form.dokterId}
                onChange={(e) => setForm({ ...form, dokterId: e.target.value })}
                className="rounded-2xl border border-slate-300 px-4 py-3 cursor-pointer bg-white"
                required
              >
                <option value="" disabled>-- Pilih Dokter --</option>
                {dokter.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.username}
                  </option>
                ))}
              </select>
            ) : null}
            
            <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white xl:col-span-5 hover:bg-cyan-700 transition">
              Simpan jadwal
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900">Daftar jadwal</h3>
        {!canRead ? (
          <p className="mt-4 text-sm text-slate-500">Role ini tidak memiliki akses melihat jadwal.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">Hari</th>
                  <th className="px-3 py-3">Jam</th>
                  <th className="px-3 py-3">Dokter</th>
                  <th className="px-3 py-3">Kuota</th>
                </tr>
              </thead>
              <tbody>
                {jadwal.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                      Belum ada jadwal yang tersedia.
                    </td>
                  </tr>
                ) : (
                  jadwal.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3">{item.hari}</td>
                      <td className="px-3 py-3">{item.jamMulai} - {item.jamSelesai}</td>
                      <td className="px-3 py-3 font-medium text-slate-700">{item.dokter?.username || "-"}</td>
                      <td className="px-3 py-3">{item._count?.antrian || 0}/{item.kuota}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default JadwalPage;