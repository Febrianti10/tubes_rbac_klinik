interface NavbarProps {
  userName: string;
  role: string;
}

const Navbar = ({ userName, role }: NavbarProps) => {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between rounded-xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard KlinikCare
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Sistem Manajemen Klinik Berbasis RBAC
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-gray-700">
            {userName || "Guest"}
          </p>

          <span className="text-sm text-sky-600 font-medium">
            {role || "USER"}
          </span>
        </div>

        <div className="w-11 h-11 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">
          {(userName || "G").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;