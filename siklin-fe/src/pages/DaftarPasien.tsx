import { useState } from "react";
import api from "../services/api";

const DaftarPasien = () => {
  const [form, setForm] = useState({
    nama: "",
    nik: "",
    tanggalLahir: "",
    jenisKelamin: "LAKI_LAKI",
    noHp: "",
    alamat: "",
  });

  const [loading, setLoading] = useState(false);

  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    teks: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setPesan(null);

    try {
      const payload = {
        noRM: String(form.nik),
        nama: String(form.nama),
        tglLahir: String(form.tanggalLahir),
        jenisKelamin: String(form.jenisKelamin),
        alamat: String(form.alamat),
        noTelp: String(form.noHp),
    };

      console.log("DATA DIKIRIM:", payload);

      await api.post("/pasien", payload);

      setPesan({
        tipe: "sukses",
        teks: "Pasien berhasil didaftarkan!",
      });

      setForm({
        nama: "",
        nik: "",
        tanggalLahir: "",
        jenisKelamin: "LAKI_LAKI",
        noHp: "",
        alamat: "",
      });
    } catch (err: any) {
      console.log("ERROR:", err.response?.data);

      setPesan({
        tipe: "error",
        teks:
          JSON.stringify(err.response?.data) ||
          err.message ||
          "Gagal mendaftarkan pasien.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Daftar Pasien Baru
      </h1>

      {pesan && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            pesan.tipe === "sukses"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm"
      >
        <div>
          <label className="block text-sm mb-1 text-gray-700">
            Nama Lengkap
          </label>

          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">
            NIK
          </label>

          <input
            type="text"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            required
            maxLength={16}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">
            Tanggal Lahir
          </label>

          <input
            type="date"
            name="tanggalLahir"
            value={form.tanggalLahir}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">
            Jenis Kelamin
          </label>

          <select
            name="jenisKelamin"
            value={form.jenisKelamin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">
            No HP
          </label>

          <input
            type="text"
            name="noHp"
            value={form.noHp}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700">
            Alamat
          </label>

          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          {loading ? "Menyimpan..." : "Daftarkan Pasien"}
        </button>
      </form>
    </div>
  );
};

export default DaftarPasien;