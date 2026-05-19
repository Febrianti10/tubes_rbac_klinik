import { useAuth } from "../context/AuthContext";

const modules = [
  {
    title: "Pendaftaran Pasien",
    permission: "PASIEN_CREATE",
    text: "Kelola pendaftaran dan data pasien baru.",
  },
  {
    title: "Jadwal Dokter",
    permission: "JADWAL_READ",
    text: "Lihat atau atur jadwal praktik dokter.",
  },
  {
    title: "Antrian",
    permission: "ANTRIAN_READ",
    text: "Pantau antrian pasien dan status pemeriksaan.",
  },
  {
    title: "Rekam Medis",
    permission: "REKAM_READ_ALL",
    text: "Lihat dan isi rekam medis sesuai akses.",
  },
  {
    title: "Pembayaran",
    permission: "PEMBAYARAN_READ",
    text: "Kelola transaksi dan cetak nota pembayaran.",
  },
  {
    title: "Manajemen User",
    permission: "USER_ALL",
    text: "Buat akun dan atur role pengguna.",
  },
];

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const activeModules = modules.filter((item) => hasPermission(item.permission));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Selamat datang, {user?.name || user?.username}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sistem akan menampilkan menu dan fitur sesuai role yang sedang login.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeModules.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
