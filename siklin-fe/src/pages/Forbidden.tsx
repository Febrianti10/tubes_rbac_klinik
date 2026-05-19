import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
        <p className="mt-3 text-sm text-gray-600">
          Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
