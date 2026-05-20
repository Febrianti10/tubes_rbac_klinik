import React, { useState } from 'react';

interface MedisFormProps {
  pasienId: string;
  antrianId: string;
  onSuccess: () => void;
}

export const MedisForm: React.FC<MedisFormProps> = ({ pasienId, antrianId, onSuccess }) => {
  const [keluhan, setKeluhan] = useState('');
  const [diagnosa, setDiagnosa] = useState('');
  const [resep, setResep] = useState('');
  const [totalBiaya, setTotalBiaya] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // Sesuaikan dengan prefix /api/v1
      const response = await fetch('http://localhost:3000/api/v1/rekam-medis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          pasienId, 
          antrianId, 
          keluhan, 
          diagnosa, 
          resep, 
          totalBiaya: Number(totalBiaya) 
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        alert('Rekam medis & tagihan berhasil disimpan!');
        setKeluhan(''); setDiagnosa(''); setResep(''); setTotalBiaya('');
        onSuccess(); 
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 border rounded-xl shadow-sm mb-8">
      <h3 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">🩺 Form Pemeriksaan Dokter</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Keluhan Pasien</label>
            <textarea required value={keluhan} onChange={e => setKeluhan(e.target.value)} className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" rows={3} placeholder="Tuliskan keluhan..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosa</label>
            <textarea required value={diagnosa} onChange={e => setDiagnosa(e.target.value)} className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" rows={3} placeholder="Tuliskan hasil diagnosa..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Resep Obat (Opsional)</label>
            <textarea value={resep} onChange={e => setResep(e.target.value)} className="w-full border-gray-300 border p-3 rounded-lg" rows={2} placeholder="Paracetamol 3x1..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Biaya Tindakan (Rp)</label>
            <input type="number" required value={totalBiaya} onChange={e => setTotalBiaya(Number(e.target.value))} className="w-full border-gray-300 border p-3 rounded-lg" placeholder="Contoh: 150000" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
            {loading ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
          </button>
        </div>
      </form>
    </div>
  );
};