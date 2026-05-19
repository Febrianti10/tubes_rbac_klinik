import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface RekamMedisItem {
  id: string;
  tglPeriksa: string;
  keluhan: string;
  diagnosa: string;
  resep?: string;
  pasien?: { id: string; nama: string; noRM: string };
  dokter?: { username?: string };
  antrian?: { pembayaran?: { status?: string; jumlah?: number } | null };
}

interface PasienItem {
  id: string;
  nama: string;
  noRM: string;
}

interface AntrianItem {
  id: string;
  nomorAntrian: number;
  status: string;
  jadwal?: { dokter?: { username?: string } };
  pasien?: { id?: string; nama?: string; noRM?: string };
}

const emptyForm = {
  pasienId: "",
  antrianId: "",
  keluhan: "",
  diagnosa: "",
  resep: "",
  totalBiaya: "",
};

const currency = (value?: number) =>
  value
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value))
    : "-";

const RiwayatKunjungan = () => {
  const { hasPermission } = useAuth();
  const [records, setRecords] = useState<RekamMedisItem[]>([]);
  const [pasien, setPasien] = useState<PasienItem[]>([]);
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [form, setForm] = useState(emptyForm);

  const canReadAll = hasPermission("REKAM_READ_ALL");
  const canReadOwn = hasPermission("REKAM_READ_OWN");
  const canCreate = hasPermission("REKAM_CREATE");

  const selectedPasien = pasien.find((item) => item.id === form.pasienId);

  const fetchData = async () => {
    const endpoint = canReadAll ? "/rekam-medis" : "/rekam-medis/history";
    const res = await api.get(endpoint);
    setRecords(Array.isArray(res.data) ? res.data : res.data.data || []);

    if (canCreate) {
      const [pasienRes, antrianRes] = await Promise.all([
        api.get("/pasien"),
        api.get("/antrian"),
      ]);
      setPasien(pasienRes.data.data || []);
      setAntrian(
        (Array.isArray(antrianRes.data) ? antrianRes.data : antrianRes.data.data || []).filter(
          (item: AntrianItem) => item.status === "DIPERIKSA",
        ),
      );
    }
  };

  useEffect(() => {
    fetchData().catch(() => {
      setRecords([]);
      setPasien([]);
      setAntrian([]);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/rekam-medis", {
      pasienId: form.pasienId,
      antrianId: form.antrianId,
      keluhan: form.keluhan,
      diagnosa: form.diagnosa,
      resep: form.resep,
      totalBiaya: Number(form.totalBiaya),
    });
    setForm(emptyForm);
    await fetchData();
  };

  const pilihAntrian = (value: string) => {
    const selected = antrian.find((item) => item.id === value);
    setForm((prev) => ({
      ...prev,
      antrianId: value,
      pasienId: selected?.pasien?.id || "",
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Rekam Medis</h2>
        <p className="mt-2 text-sm text-slate-500">
          Dokter mengisi pemeriksaan berdasarkan antrian yang sedang diperiksa. Setelah disimpan, tagihan otomatis tersambung ke kasir.
        </p>
      </div>

      {canCreate ? (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Input rekam medis</h3>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
            <select
              value={form.antrianId}
              onChange={(e) => pilihAntrian(e.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3"
              required
            >
              <option value="">Pilih antrian terkait</option>
              {antrian.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.nomorAntrian} - {item.pasien?.nama || "Pasien"} - {item.pasien?.noRM || "-"} - {item.jadwal?.dokter?.username || "-"}
                </option>
              ))}
            </select>

            <input
              value={selectedPasien ? `${selectedPasien.nama} - ${selectedPasien.noRM}` : ""}
              readOnly
              placeholder="Pasien akan terisi dari antrian"
              className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3"
            />

            <textarea
              value={form.keluhan}
              onChange={(e) => setForm({ ...form, keluhan: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              placeholder="Keluhan pasien"
              required
            />

            <textarea
              value={form.diagnosa}
              onChange={(e) => setForm({ ...form, diagnosa: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              placeholder="Diagnosa"
              required
            />

            <textarea
              value={form.resep}
              onChange={(e) => setForm({ ...form, resep: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              placeholder="Resep"
            />

            <input
              type="number"
              min="0"
              value={form.totalBiaya}
              onChange={(e) => setForm({ ...form, totalBiaya: e.target.value })}
              className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              placeholder="Total biaya tindakan"
              required
            />

            <button
              type="submit"
              className="rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white md:col-span-2"
            >
              Simpan rekam medis dan buat tagihan
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900">
          {canReadAll ? "Seluruh rekam medis" : canReadOwn ? "Riwayat kunjungan saya" : "Akses rekam medis"}
        </h3>
        {!canReadAll && !canReadOwn ? (
          <p className="mt-4 text-sm text-slate-500">Role ini tidak memiliki akses membaca rekam medis.</p>
        ) : (
          <div className="mt-5 grid gap-4">
            {records.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {item.pasien?.nama || "Riwayat Saya"}
                  </h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                    {new Date(item.tglPeriksa).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Dokter: {item.dokter?.username || "-"}</p>
                <p className="mt-3 text-sm text-slate-700"><strong>Keluhan:</strong> {item.keluhan}</p>
                <p className="mt-2 text-sm text-slate-700"><strong>Diagnosa:</strong> {item.diagnosa}</p>
                <p className="mt-2 text-sm text-slate-700"><strong>Resep:</strong> {item.resep || "-"}</p>
                <p className="mt-2 text-sm text-slate-700"><strong>Status Tagihan:</strong> {item.antrian?.pembayaran?.status || "-"}</p>
                <p className="mt-2 text-sm text-slate-700"><strong>Total Tagihan:</strong> {currency(item.antrian?.pembayaran?.jumlah)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RiwayatKunjungan;
