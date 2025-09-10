import { useState } from "react";
import { login as loginRequest } from "../../utils/auth"; 

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await loginRequest(username.trim(), password);
      localStorage.setItem("token", token);
      onLoggedIn?.();
    } catch (err) {
      setError(err?.message === "Invalid credentials"
        ? "Invalid credentials"
        : "Unable to login. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 rounded-xl bg-white shadow">
      <img
        className="w-1/2 m-auto"
        alt="Capmation logo"
        src="/capmation-agents-logo.png"
      />

      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full rounded px-3 py-2 border cursor-pointer"
          disabled={loading}
          aria-busy={loading}
        >
          {!loading ? (
            <span>Login</span>
          ) : (
            <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-amber-500 m-auto" />
          )}
        </button>
      </form>
    </div>
  );
}
