import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import DaftarPasien from "./pages/DaftarPasien";
import Antrian from "./pages/Antrian";
import RiwayatKunjungan from "./pages/RiwayatKunjungan";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 text-sm">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>

          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>

          <Link to="/daftar-pasien" className="text-blue-600 hover:underline">
            Daftar Pasien
          </Link>

          <Link to="/antrian" className="text-blue-600 hover:underline">
            Antrian
          </Link>

          <Link
            to="/riwayat-kunjungan"
            className="text-blue-600 hover:underline"
          >
            Riwayat Kunjungan
          </Link>
        </nav>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar-pasien" element={<DaftarPasien />} />
          <Route path="/antrian" element={<Antrian />} />
          <Route
            path="/riwayat-kunjungan"
            element={<RiwayatKunjungan />}
          />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;