import { useEffect, useState } from "react";
import api from "../services/api";

const RekamMedis = () => {
  // State untuk menampung data dari API
  const [daftarAntrianAktif, setDaftarAntrianAktif] = useState<any[]>([]);
  const [daftarRekamMedis, setDaftarRekamMedis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State Form Input sesuai UI desain Anda
  const [selectedAntrianId, setSelectedAntrianId] = useState("");
  const [keluhan, setKeluhan] = useState("");
  const [diagnosa, setDiagnosa] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [resep, setResep] = useState("");

  // 1. Fungsi mengambil data dari Backend MySQL kelompok Anda
  const fetchData = async () => {
    try {
      // Ambil daftar seluruh antrian klinik
      const antrianRes = await api.get("/antrian");
      let dataAntrian = antrianRes.data;
      if (dataAntrian && dataAntrian.data) dataAntrian = dataAntrian.data;

      if (Array.isArray(dataAntrian)) {
        // FILTER: Hanya tampilkan antrian yang statusnya MENUNGGU atau DIPERIKSA
        const aktif = dataAntrian.filter(
          (item: any) => item.status === "MENUNGGU" || item.status === "DIPERIKSA"
        );
        setDaftarAntrianAktif(aktif);
      }

      // Ambil riwayat rekam medis yang sudah terinput sebelumnya
      const rmRes = await api.get("/rekam-medis");
      let dataRM = rmRes.data;
      if (dataRM && dataRM.data) dataRM = dataRM.data;
      setDaftarRekamMedis(Array.isArray(dataRM) ? dataRM : []);
    } catch (error) {
      console.error("Gagal memuat data integrasi rekam medis:", error);
    }
  };

  useEffect(() => {
    fetchData().catch(() => {});
  }, []);

  // 2. Fungsi submit rekam medis baru & update status antrian pasien
  const handleSubmitRekamMedis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAntrianId) {
      alert("Silakan pilih pasien dari antrian aktif terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      // Cari data antrian terpilih untuk mendapatkan pasienId dan jadwalId terkait
      const antrianTerpilih = daftarAntrianAktif.find((a) => a.id === selectedAntrianId);
      const pasienId = antrianTerpilih?.pasienId || antrianTerpilih?.pasien?.id;
      const dokterId = antrianTerpilih?.jadwal?.dokterId;

      // POST data rekam medis baru ke backend
      const payloadRM = {
        pasienId: pasienId,
        antrianId: selectedAntrianId,
        keluhan: keluhan,
        diagnosa: diagnosa,
        tindakan: tindakan || "-", // Fallback tanda strip jika kosong seperti UI lama
        resep: resep,
        dokterId: dokterId
      };

      const resRM = await api.post("/rekam-medis", payloadRM);

      if (resRM.status === 200 || resRM.status === 201) {
        // UPDATE STATUS ANTRIAN MENJADI 'SELESAI'
        // Jika backend Anda belum otomatis mengubah status saat rekam medis dibuat,
        // kita tembak endpoint PUT/PATCH antrian secara manual dari frontend:
        try {
          await api.put(`/antrian/${selectedAntrianId}`, { status: "SELESAI" });
        } catch (err) {
          console.log("Catatan: Backend mungkin sudah otomatis mengupdate status antrian.");
        }

        alert("Data Rekam Medis berhasil disimpan dan status antrian diperbarui!");
        
        // Reset form input isi pemeriksaan klinis
        setSelectedAntrianId("");
        setKeluhan("");
        setDiagnosa("");
        setTindakan("");
        setResep("");

        // Refresh data agar tabel langsung terupdate & pasien keluar dari dropdown
        await fetchData();
      }
    } catch (error: any) {
      console.error("Gagal menyimpan rekam medis:", error);
      alert(error.response?.data?.message || "Gagal menyimpan data rekam medis baru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* JUDUL HALAMAN */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Form Rekam Medis Pasien</h2>
        <p className="mt-2 text-sm text-slate-500">
          Gunakan formulir ini untuk menginput keluhan, tindakan medis, serta resep obat pasien saat pemeriksaan berjalan.
        </p>
      </div>

      {/* CARD 1: INPUT DATA PEMERIKSAAN BARU */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">Input Data Pemeriksaan Baru</h3>
        
        <form onSubmit={handleSubmitRekamMedis} className="space-y-4">
          {/* DROPDOWN ANTRIAN AKTIF */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pilih Pasien / Nomor Antrian aktif
            </label>
            <select
              value={selectedAntrianId}
              onChange={(e) => setSelectedAntrianId(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
            >
              <option value="">-- Pilih pasien dari Antrian Klinik --</option>
              {daftarAntrianAktif.map((item: any) => {
                const noAntrian = item.nomorAntrian ? `No. ${item.nomorAntrian}` : "Antrian";
                const namaPasien = item.pasien?.nama || item.pasien?.name || "Pasien Umum";
                const namaDokter = item.jadwal?.dokter?.nama || item.jadwal?.dokter?.name || "Dokter";
                return (
                  <option key={item.id} value={item.id}>
                    {noAntrian} — {namaPasien} ({namaDokter})
                  </option>
                );
              })}
            </select>
          </div>

          {/* BARIS KELUHAN & DIAGNOSA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keluhan Utama</label>
              <textarea
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                required
                rows={3}
                placeholder="Tuliskan keluhan yang dirasakan oleh pasien..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosa Klinis</label>
              <textarea
                value={diagnosa}
                onChange={(e) => setDiagnosa(e.target.value)}
                required
                rows={3}
                placeholder="Tuliskan hasil diagnosa penyakit medis pasien..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition resize-none"
              />
            </div>
          </div>

          {/* BARIS TINDAKAN & RESEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tindakan Medis</label>
              <input
                type="text"
                value={tindakan}
                onChange={(e) => setTindakan(e.target.value)}
                placeholder="Contoh: Pemberian Oksigen, Jahit Luka, Injeksi"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resep Obat</label>
              <input
                type="text"
                value={resep}
                onChange={(e) => setResep(e.target.value)}
                required
                placeholder="Contoh: Paracetamol 500mg (3x1), Amoxicillin (3x1)"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* TOMBOL SIMPAN */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-cyan-700 transition text-sm disabled:bg-slate-300"
            >
              {loading ? "Menyimpan..." : "Simpan Rekam Medis"}
            </button>
          </div>
        </form>
      </section>

      {/* CARD 2: TABEL DAFTAR REKAM MEDIS TERINPUT */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">Daftar Rekam Medis Terinput</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Data Pasien</th>
                <th className="px-4 py-3">Dokter</th>
                <th className="px-4 py-3">Keluhan & Diagnosa</th>
                <th className="px-4 py-3">Tindakan</th>
                <th className="px-4 py-3">Resep Obat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarRekamMedis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada data pemeriksaan klinis pasien yang terinput.
                  </td>
                </tr>
              ) : (
                daftarRekamMedis.map((rm: any) => (
                  <tr key={rm.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{rm.pasien?.nama || rm.pasien?.name || "Pasien"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">No.RM: {rm.pasien?.noRM || `RM-00${rm.pasienId || 'X'}`}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{rm.dokter?.nama || rm.dokter?.name || "dokter1"}</td>
                    <td className="px-4 py-4 space-y-1 max-w-xs">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Keluhan: </span>
                        <span className="text-slate-600 text-xs">{rm.keluhan}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Diagnosa: </span>
                        <span className="text-slate-900 font-medium text-xs">{rm.diagnosa}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{rm.tindakan || "-"}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-xl bg-cyan-50/60 border border-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                        {rm.resep}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RekamMedis;