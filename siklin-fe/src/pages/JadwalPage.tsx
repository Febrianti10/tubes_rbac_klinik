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
  roles?: Array<{ role?: { name?: string } }>;
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
      const jadwalRes = await api.get("/jadwal");
      const jadwalData = Array.isArray(jadwalRes.data) ? jadwalRes.data : jadwalRes.data.data || [];
      setJadwal(jadwalData);
    }

    if (canManage && hasPermission("USER_ALL")) {
      const usersRes = await api.get("/users");
      const dokterList = (Array.isArray(usersRes.data) ? usersRes.data : []).filter((item: UserItem) =>
        item.roles?.some((role) => role.role?.name === "DOKTER")
      );
      setDokter(dokterList);
      if (dokterList.length === 1) {
        setForm((prev) => ({ ...prev, dokterId: dokterList[0].id }));
      }
    } else if (canManage && hasRole("DOKTER") && user?.id) {
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
    await api.post("/jadwal", { ...form, kuota: Number(form.kuota) });
    setForm((prev) => ({ ...emptyForm, dokterId: prev.dokterId }));
    await fetchData();
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
              placeholder="Hari"
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
                className="rounded-2xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Pilih dokter</option>
                {dokter.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.username}
                  </option>
                ))}
              </select>
            ) : null}
            <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white xl:col-span-5">
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
                {jadwal.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{item.hari}</td>
                    <td className="px-3 py-3">{item.jamMulai} - {item.jamSelesai}</td>
                    <td className="px-3 py-3">{item.dokter?.username || "-"}</td>
                    <td className="px-3 py-3">{item._count?.antrian || 0}/{item.kuota}</td>
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

export default JadwalPage;
