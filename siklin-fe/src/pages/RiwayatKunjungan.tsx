import { useEffect, useState } from "react";
import api from "../services/api";

interface RekamMedis {
  id: string;
  tanggal: string;
  keluhan: string;
  diagnosa: string;
  tindakan: string;
  pasien: { nama: string; nik: string };
  dokter?: { nama: string };
}

const RiwayatKunjungan = () => {
  const [data, setData] = useState<RekamMedis[]>([]);
  const [loading, setLoading] = useState(true);
  const [cari, setCari] = useState("");

  useEffect(() => {
    api
      .get("/rekam-medis")
      .then((res) => setData(res.data.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(
    (r) =>
      r.pasien?.nama?.toLowerCase().includes(cari.toLowerCase()) ||
      r.pasien?.nik?.includes(cari)
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-5 text-gray-800">
        Riwayat Kunjungan Pasien
      </h1>

      <input
        placeholder="Cari nama atau NIK pasien..."
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        className="w-full mb-5 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-10">
          Memuat data...
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          Tidak ada riwayat kunjungan.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-800">{r.pasien?.nama}</p>
                  <p className="text-xs text-gray-500">NIK: {r.pasien?.nik}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(r.tanggal).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Keluhan: </span>
                  <span className="text-gray-800">{r.keluhan}</span>
                </div>
                <div>
                  <span className="text-gray-500">Diagnosa: </span>
                  <span className="text-gray-800">{r.diagnosa}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tindakan: </span>
                  <span className="text-gray-800">{r.tindakan}</span>
                </div>
                {r.dokter && (
                  <div>
                    <span className="text-gray-500">Dokter: </span>
                    <span className="text-gray-800">{r.dokter.nama}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatKunjungan;