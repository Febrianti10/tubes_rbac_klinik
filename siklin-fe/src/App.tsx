import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DaftarPasien from "./pages/DaftarPasien";
import Antrian from "./pages/Antrian";
import RiwayatKunjungan from "./pages/RiwayatKunjungan";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 text-sm">
          <Link to="/daftar-pasien" className="text-blue-600 hover:underline">
            Daftar Pasien
          </Link>
          <Link to="/antrian" className="text-blue-600 hover:underline">
            Antrian
          </Link>
          <Link to="/riwayat-kunjungan" className="text-blue-600 hover:underline">
            Riwayat Kunjungan
          </Link>
        </nav>
        <Routes>
          <Route path="/daftar-pasien" element={<DaftarPasien />} />
          <Route path="/antrian" element={<Antrian />} />
          <Route path="/riwayat-kunjungan" element={<RiwayatKunjungan />} />
          <Route path="/" element={<DaftarPasien />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;