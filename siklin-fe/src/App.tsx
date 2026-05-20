import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Forbidden from "./pages/Forbidden";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import DaftarPasien from "./pages/DaftarPasien";
import Antrian from "./pages/Antrian";
import RiwayatKunjungan from "./pages/RiwayatKunjungan";
import Pembayaran from "./pages/Pembayaran";
import JadwalPage from "./pages/JadwalPage";
import UsersPage from "./pages/UsersPage";
import AppShell from "./pages/AppShell";

// TAMBAHAN IMPORT BARU (Tanpa menghapus import lama)
import { JadwalDokter } from "./pages/JadwalDokter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />

            <Route
              element={<ProtectedRoute requiredPermissions={["PASIEN_READ_ALL"]} />}
            >
              <Route path="/pasien" element={<DaftarPasien />} />
            </Route>

            <Route
              element={<ProtectedRoute requiredPermissions={["ANTRIAN_READ"]} />}
            >
              <Route path="/antrian" element={<Antrian />} />
            </Route>

            <Route
              element={<ProtectedRoute requiredPermissions={["JADWAL_READ"]} />}
            >
              {/* REVISI: Mengubah element dari <JadwalPage /> menjadi <JadwalDokter /> */}
              <Route path="/jadwal" element={<JadwalDokter />} />
            </Route>

            <Route
              element={<ProtectedRoute requiredPermissions={["PEMBAYARAN_READ"]} />}
            >
              <Route path="/pembayaran" element={<Pembayaran />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["SUPERADMIN", "DOKTER", "PASIEN", "PERAWAT"]}
                />
              }
            >
              <Route path="/rekam-medis" element={<RiwayatKunjungan />} />
            </Route>

            <Route
              path="/users"
              element={<ProtectedRoute requiredPermissions={["USER_ALL"]} />}
            >
              <Route index element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;