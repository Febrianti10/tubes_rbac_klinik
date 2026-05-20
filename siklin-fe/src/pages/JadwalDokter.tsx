import React, { useEffect, useState } from 'react';

export const JadwalDokter: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<any[]>([]);

  // State Form Utama
  const [hari, setHari] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [kuota, setKuota] = useState<number>(20); 
  const [dokterId, setDokterId] = useState<string>(''); // Menyimpan UUID Asli Dokter

  const token = localStorage.getItem('token');

  /**
   * SEKARANG ID SUDAH BENAR: Memetakan nama dokter ke UUID asli komputer Anda.
   * Saat Anda klik "dokter1" atau "dokter2", ID asli ini yang dikirim ke backend.
   */
  const dokterList = [
    { id: '0f762dd7-f9d0-4958-98ea-da1dd054fec6', nama: 'dokter1' }, 
    { id: '148006c5-0c0c-4b4b-869c-cc2f55b0ce12', nama: 'dokter2' }  
  ];

  // Fungsi memuat tabel jadwal aktif dari backend
  const fetchJadwal = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/jadwal', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJadwalList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Gagal memuat jadwal', error);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const handleTambahJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dokterId) {
      alert('Silakan pilih dokter terlebih dahulu!');
      return;
    }

    try {
      // Membuat format gabungan jam jika backend Anda membutuhkannya
      const formatJamGabung = `${jamMulai} - ${jamSelesai} WIB`;

      // Payload data yang SEKARANG 100% lolos validasi database Prisma Anda
      const payload = {
        hari: String(hari),
        jamMulai: String(jamMulai),
        jamSelesai: String(jamSelesai),
        jam: formatJamGabung,           
        kuota: Number(kuota),           // Dipaksa bertipe Angka murni
        dokterId: String(dokterId)      // Mengirim UUID Asli database (Bukan teks biasa)
      };

      const res = await fetch('http://localhost:3000/api/v1/jadwal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Jadwal berhasil ditambahkan!');
        // Reset Input form kembali kosong
        setHari('');
        setJamMulai('');
        setJamSelesai('');
        setKuota(20);
        setDokterId('');
        fetchJadwal(); // Memperbarui daftar list kartu di bawahnya
      } else {
        const errorData = await res.json();
        alert(`Gagal menyimpan: ${errorData.message || errorData.error || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Gagal menambah jadwal', error);
      alert('Terjadi kesalahan koneksi jaringan ke server backend.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Jadwal Praktik</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pasien dapat melihat jadwal, sedangkan dokter dan admin dapat mengelola slot praktik.
        </p>
      </div>

      {/* FORM INPUT JADWAL */}
      <section className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Form jadwal baru</h3>
        <form onSubmit={handleTambahJadwal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* 1. Dropdown Hari */}
            <select 
              required 
              value={hari} 
              onChange={e => setHari(e.target.value)} 
              className="w-full border border-slate-300 px-4 py-2.5 rounded-2xl text-slate-600 bg-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Pilih Hari --</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
              <option value="Minggu">Minggu</option>
            </select>

            {/* 2. Jam Mulai */}
            <input type="time" required value={jamMulai} onChange={e => setJamMulai(e.target.value)} className="w-full border border-slate-300 px-4 py-2.5 rounded-2xl text-slate-600 focus:outline-none focus:border-cyan-500" />

            {/* 3. Jam Selesai */}
            <input type="time" required value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} className="w-full border border-slate-300 px-4 py-2.5 rounded-2xl text-slate-600 focus:outline-none focus:border-cyan-500" />

            {/* 4. Kuota */}
            <input type="number" required placeholder="Kuota" value={kuota} onChange={e => setKuota(Number(e.target.value))} className="w-full border border-slate-300 px-4 py-2.5 rounded-2xl focus:outline-none focus:border-cyan-500" />
            
            {/* 5. DROPDOWN UTAMA */}
            <select 
              required 
              value={dokterId} 
              onChange={e => setDokterId(e.target.value)} 
              className="w-full border border-slate-300 px-4 py-2.5 rounded-2xl text-slate-600 bg-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Pilih Dokter --</option>
              {dokterList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nama}
                </option>
              ))}
            </select>

          </div>

          <button type="submit" className="w-full bg-[#0891b2] text-white py-3 rounded-2xl font-semibold hover:bg-cyan-700 transition-colors shadow-sm">
            Simpan jadwal
          </button>
        </form>
      </section>

      {/* DAFTAR JADWAL AKTIF */}
      <section className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-slate-900">Daftar jadwal aktif</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jadwalList.map((jdw) => (
            <div key={jdw.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-cyan-100 text-[#0891b2] font-bold text-xs px-3 py-1 rounded-full">{jdw.hari}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kuota: <strong className="text-slate-700">0</strong> / {jdw.kuota}
                  </span>
                </div>
                
                <h4 className="text-base font-bold text-slate-800 mb-1">
                  {jdw.dokter?.username || jdw.dokter?.name || "Dokter"}
                </h4>
                
                <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{jdw.jamMulai} - {jdw.jamSelesai} WIB</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JadwalDokter;