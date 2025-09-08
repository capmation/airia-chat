// src/Login.jsx
import { useState } from "react";
import { api } from "../../utils/api";

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", { username, password });
      localStorage.setItem("token", data.token);
      onLoggedIn?.();
    } catch (err) {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 rounded-xl bg-white shadow">
      <img
          className="w-1/2 sm:w-1/4 m-auto"
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
        <button className="w-full rounded px-3 py-2 border">Login</button>
      </form>
    </div>
  );
}
