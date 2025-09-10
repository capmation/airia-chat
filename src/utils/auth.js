export async function login(username, password) {
  const base = import.meta.env.VITE_API_BASE_URL;
  const r = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Invalid credentials");
  const { token } = await r.json();
  return token;
}

import {
  connectSocket,
  getSocket,
  updateSocketToken,
  wireSocket, 
} from "./socket";


export function handleLoggedIn({
  setAuthed,
  setWsStatus,
  socketRef,
  cleanupRef,
  onTeamCreated, 
  onProjectCreated,
  onProjectDeleted,
  onProjectUpdated, 
  wsUrl,
  wsPath,
}) {
  const token = localStorage.getItem("token");
  setAuthed(!!token);
  if (!token) return;

  const url = wsUrl ?? import.meta.env.VITE_WS_URL ?? "http://localhost:8787";
  const path = wsPath ?? import.meta.env.VITE_WS_PATH ?? "/socket.io";

  try {
    updateSocketToken(token);
    const s = getSocket();
    socketRef.current = s;

    cleanupRef.current?.();
    cleanupRef.current = wireSocket(s, {
      setWsStatus,
      onTeamCreated,
      onProjectCreated,
      onProjectDeleted,
      onProjectUpdated, 
    });
  } catch {
    const s = connectSocket({ token, url, path });
    socketRef.current = s;

    cleanupRef.current?.();
    cleanupRef.current = wireSocket(s, {
      setWsStatus,
      onTeamCreated,
      onProjectCreated,
      onProjectDeleted,
      onProjectUpdated, 
    });
  }
}

export function handleLogout({
  setAuthed,
  setWsStatus,
  socketRef,
  cleanupRef,
}) {
  localStorage.removeItem("token");
  setAuthed(false);
  setWsStatus?.("disconnected");

  try {
    cleanupRef?.current?.();
    getSocket().disconnect();
  } catch { /* noop */ }

  if (socketRef) socketRef.current = null;
  if (cleanupRef) cleanupRef.current = null;
}