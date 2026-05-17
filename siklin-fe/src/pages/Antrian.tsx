import { useEffect, useState } from "react";
import api from "../services/api";

interface Antrian {
  id: string;
  nomorAntrian: number;
  status: string;
  pasien: { nama: string };
  jadwal: { tanggal: string; dokter?: { nama: string } };
}

const Antrian = () => {
  const [antrian, setAntrian] = useState<Antrian[]>([]);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [form, setForm] = useState({ pasienId: "", jadwalId: "" });
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    teks: string;
  } | null>(null);

  const fetchAntrian = async () => {
    try {
      const res = await api.get("/antrian");
      setAntrian(res.data.data || []);
    } catch {
      setAntrian([]);
    }
  };

  useEffect(() => {
    fetchAntrian();
    api
      .get("/jadwal")
      .then((r) => setJadwalList(r.data.data || []))
      .catch(() => {});
    api
      .get("/pasien")
      .then((r) => setPasienList(r.data.data || []))
      .catch(() => {});
  }, []);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan(null);
    try {
      await api.post("/antrian", form);
      setPesan({ tipe: "sukses", teks: "Antrian berhasil dibuat!" });
      setForm({ pasienId: "", jadwalId: "" });
      fetchAntrian();
    } catch (err: any) {
      setPesan({
        tipe: "error",
        teks: err.response?.data?.message || "Gagal membuat antrian.",
      });
    } finally {
      setLoading(false);
    }
  };

  const badgeWarna = (status: string) => {
    if (status === "MENUNGGU") return "bg-yellow-100 text-yellow-700";
    if (status === "DIPANGGIL") return "bg-blue-100 text-blue-700";
    if (status === "SELESAI") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Antrian Pasien</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-medium mb-4 text-gray-700">
          Tambah ke Antrian
        </h2>
        {pesan && (
          <div
            className={`mb-3 p-3 rounded-lg text-sm ${
              pesan.tipe === "sukses"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {pesan.teks}
          </div>
        )}
        <form onSubmit={handleDaftar} className="space-y-3">
          <select
            value={form.pasienId}
            onChange={(e) => setForm({ ...form, pasienId: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">-- Pilih Pasien --</option>
            {pasienList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} — {p.nik}
              </option>
            ))}
          </select>
          <select
            value={form.jadwalId}
            onChange={(e) => setForm({ ...form, jadwalId: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">-- Pilih Jadwal --</option>
            {jadwalList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.tanggal} — {j.dokter?.nama}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Menyimpan..." : "Tambah Antrian"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {antrian.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Belum ada antrian hari ini.
          </p>
        ) : (
          antrian.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
                {a.nomorAntrian}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">
                  {a.pasien?.nama}
                </p>
                <p className="text-xs text-gray-500">{a.jadwal?.tanggal}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${badgeWarna(a.status)}`}
              >
                {a.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Antrian;