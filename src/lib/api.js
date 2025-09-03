import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.warn(
    "[api] VITE_API_BASE_URL is not defined "
  );
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

console.log("[api] baseURL =", api.defaults.baseURL);
