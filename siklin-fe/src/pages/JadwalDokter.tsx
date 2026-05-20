import { useEffect, useState } from "react";
import api from "../services/api";
// WAJIB: Gunakan AuthContext dari aplikasi Anda untuk membaca role user
import { useAuth } from "../context/AuthContext"; 

const JadwalDokter = () => {
  // Ambil data user yang sedang login
  const { user } = useAuth();
  
  // Kunci akses: Yang boleh melihat form HANYA SUPERADMIN dan DOKTER
  const canManageJadwal = user?.role === "SUPERADMIN" || user?.role === "DOKTER";

  const [jadwal, setJadwal] = useState<any[]>([]);
  
  // State Form
  const [hari, setHari] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [kuota, setKuota] = useState("");
  const [dokterId, setDokterId] = useState("");

  const fetchJadwal = async () => {
    try {
      const response = await api.get("/jadwal");
      let data = response.data;
      if (data && data.data) data = data.data;
      setJadwal(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat jadwal:", error);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    // Proteksi tambahan: jika pasien berhasil memunculkan tombol lewat inspect element, fungsi tetap ditolak
    if (!canManageJadwal) return; 

    try {
      await api.post("/jadwal", { 
        hari, 
        jamMulai, 
        jamSelesai, 
        kuota: Number(kuota), 
        dokterId 
      });
      // Reset form
      setHari(""); setJamMulai(""); setJamSelesai(""); setKuota(""); setDokterId("");
      fetchJadwal();
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Jadwal Praktik</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pasien dapat melihat jadwal, sedangkan dokter dan admin dapat mengelola slot praktik.
        </p>
      </div>

      {/* =========================================================================
          🔒 BLOK FORM INPUT: HANYA TAMPIL UNTUK ADMIN DAN DOKTER
          Pasien TIDAK AKAN melihat kotak form ini
          ========================================================================= */}
      {canManageJadwal && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Form jadwal baru</h3>
          <form onSubmit={handleSimpan} className="flex flex-wrap gap-4 items-end">
            
            <div className="flex-1 min-w-[150px]">
              <select value={hari} onChange={(e) => setHari(e.target.value)} required className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-cyan-500 bg-white">
                <option value="">-- Pilih Hari --</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} required className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-cyan-500" />
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} required className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-cyan-500" />
            </div>
            
            <div className="flex-1 min-w-[100px]">
              <input type="number" placeholder="Kuota" value={kuota} onChange={(e) => setKuota(e.target.value)} required min="1" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-cyan-500" />
            </div>

            <div className="flex-1 min-w-[150px]">
              <select value={dokterId} onChange={(e) => setDokterId(e.target.value)} required className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-cyan-500 bg-white">
                <option value="">-- Pilih Dokter --</option>
                <option value="1">dokter1</option>
                <option value="2">dokter2</option>
              </select>
            </div>

            <button type="submit" className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-cyan-700 w-full transition-colors">
              Simpan jadwal
            </button>
          </form>
        </section>
      )}

      {/* =========================================================================
          ✅ BLOK DAFTAR JADWAL: TAMPIL UNTUK SEMUA ROLE (Termasuk Pasien)
          ========================================================================= */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 text-slate-900">Daftar jadwal aktif</h3>
        
        {/* Layout Grid Card Sesuai Gambar UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jadwal.length === 0 ? (
            <p className="text-sm text-slate-500 col-span-full">Belum ada jadwal dokter yang aktif.</p>
          ) : (
            jadwal.map((item: any) => (
              <div key={item.id} className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.hari}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kuota: <span className="text-slate-900 font-bold">{item.kuotaTerisi || 0} / {item.kuota}</span>
                  </span>
                </div>
                
                <h4 className="font-bold text-slate-800 text-lg">
                  {item.dokter?.nama || item.dokter?.name || "Nama Dokter"}
                </h4>
                
                <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.jamMulai} - {item.jamSelesai} WIB
                </p>
                
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default JadwalDokter;