import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MedisForm } from '../components/MedisForm';
import { useAuth } from '../context/AuthContext'; // ✅ FIX: Jalur import disesuaikan

export const RekamMedis: React.FC = () => {
  const { hasPermission } = useAuth(); // ✅ FIX: Menggunakan hasPermission sesuai AuthContext Anda
  const [rekamMedis, setRekamMedis] = useState<any[]>([]);
  
  // Dummy data (sesuaikan dengan kebutuhan alur aplikasi Anda)
  const activePasienId = "user-pasien-1"; 
  const activeAntrianId = "antrian-123"; 

  const fetchRekamMedis = async () => {
    // ✅ FIX: Penentuan endpoint berdasarkan permission yang valid
    const isDokter = hasPermission('REKAM_READ_ALL');
    
    // Sesuaikan prefix url jika backend Anda menggunakan /api/v1. 
    // Jika tidak, cukup gunakan '/rekam-medis' dan '/rekam-medis/history'
    const endpoint = isDokter ? '/api/v1/rekam-medis' : '/api/v1/rekam-medis/history';

    try {
      // ✅ FIX: Menggunakan instance 'api' agar token otomatis terkirim
      const res = await api.get(endpoint);
      
      // ✅ FIX: Membaca data dengan aman dari Axios (.data atau .data.data)
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setRekamMedis(data);
    } catch (error) {
      console.error("Gagal mengambil data rekam medis:", error);
    }
  };

  useEffect(() => {
    if (hasPermission('REKAM_READ_ALL') || hasPermission('REKAM_READ_OWN')) {
      fetchRekamMedis();
    }
  }, []);

  // STRICT RBAC: Jika tidak punya akses baca sama sekali
  if (!hasPermission('REKAM_READ_ALL') && !hasPermission('REKAM_READ_OWN')) {
    return (
      <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-3xl border border-red-200">
        Akses Ditolak: Anda tidak memiliki izin untuk melihat Rekam Medis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Manajemen Rekam Medis</h2>
        <p className="mt-2 text-sm text-slate-500">
          Mencatat histori medis pasien, keluhan, diagnosa, serta pemberian resep obat.
        </p>
      </div>

      {/* TAMPIL JIKA PUNYA PERMISSION: REKAM_CREATE (Biasanya Dokter) */}
      {hasPermission('REKAM_CREATE') && (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <MedisForm 
            pasienId={activePasienId} 
            antrianId={activeAntrianId} 
            onSuccess={fetchRekamMedis} 
          />
        </section>
      )}

      {/* HISTORI REKAM MEDIS */}
      <section className="rounded-3xl border border-slate-200 p-6 bg-white">
        <h3 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-3">
          📋 Histori Rekam Medis
        </h3>
        
        <div className="space-y-4">
          {rekamMedis.length === 0 ? (
            <p className="text-slate-500 italic py-4 text-center">Belum ada catatan medis yang tersedia.</p>
          ) : (
            rekamMedis.map((rm) => (
              <div 
                key={rm.id} 
                className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col md:flex-row gap-4 hover:shadow-sm transition"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1 rounded-full">
                      {new Date(rm.tglPeriksa || rm.createdAt).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      Dokter: <span className="text-slate-900 font-semibold">dr. {rm.dokter?.username || '-'}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 bg-white p-4 rounded-xl border border-slate-100">
                    <div>
                      <strong className="text-slate-500 block mb-1">Keluhan:</strong> 
                      <p className="text-slate-800">{rm.keluhan || "-"}</p>
                    </div>
                    <div>
                      <strong className="text-slate-500 block mb-1">Diagnosa:</strong> 
                      <p className="text-slate-800">{rm.diagnosa || "-"}</p>
                    </div>
                    {rm.resep && (
                      <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-3 mt-1">
                        <strong className="text-slate-500 block mb-1">Resep Obat:</strong> 
                        <p className="text-cyan-700 font-medium bg-cyan-50/50 p-2 rounded-lg border border-cyan-100/50">
                          {rm.resep}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default RekamMedis;