import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { username, password });
      login(response.data.accessToken, response.data.user);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Login Klinik
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Masuk untuk mengakses fitur sesuai role Anda
        </p>

        {error ? (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <input
          type="text"
          placeholder="Username"
          className="mb-4 w-full rounded-lg border border-gray-300 p-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border border-gray-300 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 text-white transition hover:bg-blue-700"
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
