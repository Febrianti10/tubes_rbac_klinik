import { useEffect, useState } from "react";
import api from "../services/api";

interface UserItem {
  id: string;
  username: string;
  name?: string;
  email: string;
  roles?: Array<{ roleId: string; role?: { id: string; name: string } }>;
}

interface RoleItem {
  id: string;
  name: string;
}

const emptyForm = {
  username: "",
  name: "",
  email: "",
  password: "",
  roleIds: [] as string[],
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    const [usersRes, rolesRes] = await Promise.all([api.get("/users"), api.get("/roles")]);
    setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    setRoles(rolesRes.data.data || []);
  };

  useEffect(() => {
    fetchData().catch(() => {
      setUsers([]);
      setRoles([]);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/users", form);
    setForm(emptyForm);
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Manajemen User</h2>
        <p className="mt-2 text-sm text-slate-500">
          Superadmin dapat membuat akun, melihat role aktif, dan merapikan distribusi akses.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-xl font-semibold text-slate-900">Form user baru</h3>
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="rounded-2xl border border-slate-300 px-4 py-3"
            placeholder="Username"
            required
          />
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-2xl border border-slate-300 px-4 py-3"
            placeholder="Nama lengkap"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-2xl border border-slate-300 px-4 py-3"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-2xl border border-slate-300 px-4 py-3"
            placeholder="Password"
            required
          />
          <select
            value={form.roleIds[0] || ""}
            onChange={(e) => setForm({ ...form, roleIds: e.target.value ? [e.target.value] : [] })}
            className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
            required
          >
            <option value="">Pilih role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white md:col-span-2">
            Simpan user
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900">Daftar akun</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Nama</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-3">{item.username}</td>
                  <td className="px-3 py-3">{item.name || "-"}</td>
                  <td className="px-3 py-3">{item.email}</td>
                  <td className="px-3 py-3">
                    {item.roles?.map((role) => role.role?.name).filter(Boolean).join(", ") || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
