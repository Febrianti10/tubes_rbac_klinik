import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface PembayaranItem {
  id: string;
  jumlah: number;
  metodeBayar?: string;
  status: string;
  tglBayar?: string;
  antrian?: {
    id: string;
    nomorAntrian?: number;
    rekamMedis?: { diagnosa?: string } | null;
    pasien?: { nama?: string; noRM?: string };
    jadwal?: { dokter?: { username?: string } };
  };
}

interface TagihanPendingItem {
  id: string;
  nomorAntrian: number;
  jumlah: number;
  status: string;
  diagnosa?: string;
  dokter?: string;
  noRM?: string;
  pasien?: { nama?: string };
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const Pembayaran = () => {
  const { user, hasPermission } = useAuth();
  const [riwayat, setRiwayat] = useState<PembayaranItem[]>([]);
  const [tagihanPending, setTagihanPending] = useState<TagihanPendingItem[]>([]);
  const [selectedNota, setSelectedNota] = useState<PembayaranItem | null>(null);
  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    teks: string;
  } | null>(null);
  const [form, setForm] = useState({
    antrianId: "",
    total: "",
    metode: "TUNAI",
  });

  const canCreate = hasPermission("PEMBAYARAN_CREATE");
  const canRead = hasPermission("PEMBAYARAN_READ");
  const isPatientOnly = hasPermission("PEMBAYARAN_READ") && !canCreate;

  const totalTransaksi = useMemo(
    () => riwayat.reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
    [riwayat],
  );

  const selectedPending = tagihanPending.find((item) => item.id === form.antrianId);

  const fetchData = async () => {
    if (canRead) {
      const endpoint = isPatientOnly ? "/pembayaran/my" : "/pembayaran";
      const pembayaranRes = await api.get(endpoint);
      const pembayaranData = Array.isArray(pembayaranRes.data)
        ? pembayaranRes.data
        : pembayaranRes.data?.data || [];
      setRiwayat(pembayaranData);

      if (!selectedNota && pembayaranData.length > 0) {
        setSelectedNota(pembayaranData[0]);
      }
    }

    if (canCreate) {
      const pendingRes = await api.get("/pembayaran/pending");
      const pendingData = Array.isArray(pendingRes.data)
        ? pendingRes.data
        : pendingRes.data?.data || [];
      setTagihanPending(
        pendingData.map((item: PembayaranItem) => ({
          id: item.antrian?.id || "",
          nomorAntrian: item.antrian?.nomorAntrian || 0,
          jumlah: Number(item.jumlah || 0),
          status: item.status,
          diagnosa: item.antrian?.rekamMedis?.diagnosa || "-",
          dokter: item.antrian?.jadwal?.dokter?.username || "-",
          noRM: item.antrian?.pasien?.noRM || "-",
          pasien: { nama: item.antrian?.pasien?.nama || "-" },
        })),
      );
    }
  };

  useEffect(() => {
    fetchData().catch(() => {
      setRiwayat([]);
      setTagihanPending([]);
      setPesan({
        tipe: "error",
        teks: "Data pembayaran belum bisa dimuat.",
      });
    });
  }, []);

  useEffect(() => {
    if (selectedPending) {
      setForm((prev) => ({
        ...prev,
        total: String(selectedPending.jumlah),
      }));
    }
  }, [form.antrianId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesan(null);

    try {
      await api.post("/pembayaran", {
        antrianId: form.antrianId,
        total: Number(form.total),
        metode: form.metode,
      });

      setForm({ antrianId: "", total: "", metode: "TUNAI" });
      setPesan({
        tipe: "sukses",
        teks: "Pembayaran berhasil diproses dan nota siap dicetak.",
      });
      await fetchData();
    } catch (error: any) {
      setPesan({
        tipe: "error",
        teks:
          error.response?.data?.message ||
          "Pembayaran gagal diproses. Cek kembali data transaksi.",
      });
    }
  };

  const pilihNota = (item: PembayaranItem) => {
    setSelectedNota(item);
  };

  const cetakNota = (item: PembayaranItem) => {
    setSelectedNota(item);
    window.setTimeout(() => window.print(), 120);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <h1 className="text-3xl font-bold">Pembayaran Klinik</h1>
        <p className="mt-2 text-sm text-blue-100">
          Kasir aktif: {user?.name || user?.username}
        </p>
        <p className="mt-2 text-sm text-blue-100">
          Total transaksi: {formatRupiah(totalTransaksi)}
        </p>
      </div>

      {pesan && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            pesan.tipe === "sukses"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        {canCreate ? (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Input Pembayaran</h2>
            <p className="mt-2 text-sm text-gray-500">
              Kasir memilih tagihan yang sudah dibuat dari hasil pemeriksaan dokter, lalu hanya melengkapi metode bayar.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <select
                value={form.antrianId}
                onChange={(e) => setForm({ ...form, antrianId: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Pilih tagihan pending</option>
                {tagihanPending.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.nomorAntrian} - {item.pasien?.nama || "Pasien"} - {item.noRM} - {formatRupiah(item.jumlah)}
                  </option>
                ))}
              </select>

              {selectedPending ? (
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <p>Pasien: {selectedPending.pasien?.nama}</p>
                  <p>No. RM: {selectedPending.noRM}</p>
                  <p>Dokter: {selectedPending.dokter}</p>
                  <p>Diagnosa: {selectedPending.diagnosa}</p>
                  <p>Total tagihan: {formatRupiah(selectedPending.jumlah)}</p>
                </div>
              ) : null}

              <input
                type="number"
                min="0"
                value={form.total}
                readOnly={Boolean(selectedPending)}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                placeholder="Nominal pembayaran"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />

              <select
                value={form.metode}
                onChange={(e) => setForm({ ...form, metode: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="TUNAI">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="DEBIT">Debit</option>
                <option value="TRANSFER">Transfer</option>
              </select>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Simpan Pembayaran
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Riwayat Pembayaran</h2>
            <p className="mt-2 text-sm text-gray-500">
              Pasien dapat melihat riwayat pembayaran yang sudah tercatat.
            </p>
          </section>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Preview Nota</h2>
            {selectedNota ? (
              <button
                type="button"
                onClick={() => cetakNota(selectedNota)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Cetak Nota
              </button>
            ) : null}
          </div>

          {selectedNota ? (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-700">
              <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Nota Pembayaran
              </p>
              <div className="mt-4 space-y-2">
                <p>ID Pembayaran: {selectedNota.id}</p>
                <p>
                  Tanggal:{" "}
                  {selectedNota.tglBayar
                    ? new Date(selectedNota.tglBayar).toLocaleString("id-ID")
                    : "-"}
                </p>
                <p>Pasien: {selectedNota.antrian?.pasien?.nama || "-"}</p>
                <p>No. RM: {selectedNota.antrian?.pasien?.noRM || "-"}</p>
                <p>Dokter: {selectedNota.antrian?.jadwal?.dokter?.username || "-"}</p>
                <p>Metode: {selectedNota.metodeBayar || "-"}</p>
                <p>Status: {selectedNota.status}</p>
                <p className="font-semibold">
                  Total: {formatRupiah(Number(selectedNota.jumlah || 0))}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Belum ada transaksi yang dipilih.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:hidden">
        <h2 className="text-xl font-semibold text-gray-800">Riwayat Pembayaran</h2>
        {!canRead ? (
          <p className="mt-4 text-sm text-gray-500">
            Role ini tidak memiliki akses melihat data pembayaran.
          </p>
        ) : riwayat.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Belum ada transaksi pembayaran.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-3 py-3">Pasien</th>
                  <th className="px-3 py-3">Dokter</th>
                  <th className="px-3 py-3">Metode</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Jumlah</th>
                  <th className="px-3 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-3">{item.antrian?.pasien?.nama || "-"}</td>
                    <td className="px-3 py-3">{item.antrian?.jadwal?.dokter?.username || "-"}</td>
                    <td className="px-3 py-3">{item.metodeBayar || "-"}</td>
                    <td className="px-3 py-3">{item.status}</td>
                    <td className="px-3 py-3 font-medium">
                      {formatRupiah(Number(item.jumlah || 0))}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => pilihNota(item)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          Lihat Nota
                        </button>
                        <button
                          type="button"
                          onClick={() => cetakNota(item)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
                        >
                          Cetak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedNota ? (
        <section className="receipt-print hidden print:block">
          <div className="mx-auto max-w-xl bg-white p-0 text-slate-900">
            <div className="border-b border-dashed border-slate-400 pb-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em]">Klinik RBAC</p>
              <h3 className="mt-2 text-2xl font-bold">Nota Pembayaran</h3>
              <p className="mt-1 text-sm">Bukti transaksi pelayanan klinik</p>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <p><strong>ID Nota:</strong> {selectedNota.id}</p>
              <p><strong>Tanggal Bayar:</strong> {selectedNota.tglBayar ? new Date(selectedNota.tglBayar).toLocaleString("id-ID") : "-"}</p>
              <p><strong>Nama Pasien:</strong> {selectedNota.antrian?.pasien?.nama || "-"}</p>
              <p><strong>No. RM:</strong> {selectedNota.antrian?.pasien?.noRM || "-"}</p>
              <p><strong>Dokter:</strong> {selectedNota.antrian?.jadwal?.dokter?.username || "-"}</p>
              <p><strong>Metode:</strong> {selectedNota.metodeBayar || "-"}</p>
              <p><strong>Status:</strong> {selectedNota.status}</p>
            </div>

            <div className="mt-5 border-y border-dashed border-slate-400 py-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(Number(selectedNota.jumlah || 0))}</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Pembayaran;
