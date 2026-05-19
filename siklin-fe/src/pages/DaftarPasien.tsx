import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface PasienItem {
  id: string;
  noRM: string;
  nama: string;
  tglLahir: string;
  jenisKelamin: string;
  alamat?: string;
  noTelp?: string;
}

const emptyForm = {
  nama: "",
  tglLahir: "",
  jenisKelamin: "LAKI_LAKI",
  alamat: "",
  noTelp: "",
};

const DaftarPasien = () => {
  const { hasPermission } = useAuth();
  const [pasien, setPasien] = useState<PasienItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const canRead = hasPermission("PASIEN_READ_ALL");
  const canCreate = hasPermission("PASIEN_CREATE");

  const fetchPasien = async () => {
    if (!canRead) return;
    const res = await api.get("/pasien");
    setPasien(res.data.data || []);
  };

  useEffect(() => {
    fetchPasien().catch(() => setPasien([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/pasien", form);
    setForm(emptyForm);
    setMessage("Data pasien berhasil ditambahkan. Nomor RM dibuat otomatis oleh sistem.");
    await fetchPasien();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Manajemen Pasien</h2>
        <p className="mt-2 text-sm text-slate-500">
          Petugas pendaftaran cukup mengisi biodata inti pasien. Nomor rekam medis dibuat otomatis agar konsisten.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {canCreate ? (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Form pasien baru</h3>
            <form onSubmit={submit} className="mt-5 space-y-4">
              {[
                { key: "nama", label: "Nama Pasien" },
                { key: "tglLahir", label: "Tanggal Lahir", type: "date" },
                { key: "alamat", label: "Alamat" },
                { key: "noTelp", label: "No. Telepon" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    required={field.key !== "alamat" && field.key !== "noTelp"}
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jenis Kelamin
                </label>
                <select
                  value={form.jenisKelamin}
                  onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                >
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Nomor RM akan dibuat otomatis oleh sistem saat data disimpan.
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              >
                Simpan pasien
              </button>
            </form>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Daftar pasien</h3>
          {!canRead ? (
            <p className="mt-4 text-sm text-slate-500">
              Role ini tidak memiliki akses untuk melihat semua data pasien.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3">No. RM</th>
                    <th className="px-3 py-3">Nama</th>
                    <th className="px-3 py-3">Lahir</th>
                    <th className="px-3 py-3">Kontak</th>
                  </tr>
                </thead>
                <tbody>
                  {pasien.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-3">{item.noRM}</td>
                      <td className="px-3 py-3">{item.nama}</td>
                      <td className="px-3 py-3">
                        {new Date(item.tglLahir).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-3">{item.noTelp || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DaftarPasien;
