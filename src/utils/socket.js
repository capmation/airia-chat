import { io } from "socket.io-client";

let socket = null;

export function connectSocket({
  url = import.meta.env.VITE_WS_URL,
  token,
  path = import.meta.env.VITE_WS_PATH || "/socket.io",
} = {}) {
  // If already connected, reset with the new token
  if (socket) {
    try { socket.disconnect(); } catch { /* empty */ }
    socket = null;
  }

  socket = io(url, {
    path,
    transports: ["websocket"],        // prefer WS (fallbacks available if needed)
    withCredentials: false,
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    auth: token ? { token } : {},     // JWT will be verified server-side
  });

  // Useful default logs (remove in prod)
  socket.on("connect", () => console.log("🔌 connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("🔌 disconnected:", reason));
  socket.on("connect_error", (err) => console.warn("WS connect_error:", err?.message));
  socket.on("error", (err) => console.warn("WS error:", err));

  // Basic heartbeat demo
  // eslint-disable-next-line no-unused-vars
  socket.on("pong:server", (ts) => {
    // console.log("pong:", ts);
  });

  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not initialized. Call connectSocket() after login.");
  return socket;
}

export function updateSocketToken(newToken) {
  if (!socket) return;
  // Update auth payload and force a reconnect to refresh JWT on the handshake
  socket.auth = newToken ? { token: newToken } : {};
  socket.disconnect().connect();
}

export function joinRoom(room) {
  getSocket().emit("room:join", room);
}
export function leaveRoom(room) {
  getSocket().emit("room:leave", room);
}
export function sendChat(message, room) {
  getSocket().emit("chat:message", { room, message });
}
export function pingServer() {
  getSocket().emit("ping:client");
}

export function wireSocket(s, opts = {}) {
  const { 
    setWsStatus, 
    onTeamCreated, 
    onProjectCreated,
    onProjectDeleted,
    onProjectUpdated,  
  } = opts;

  setWsStatus?.("connecting");

  const onConnect = () => {
    setWsStatus?.("connected");
    joinRoom("global"); 
    pingServer();       
  };
  const onDisconnect = () => setWsStatus?.("disconnected");
  const onConnectErr = () => setWsStatus?.("disconnected");

  const onServerNotify = (p) => console.log("server:notify", p);
  const onPong = (ts) => console.log("pong:", ts);
  const onTeam = (member) => {
    console.log("team-member:created", member);
    onTeamCreated?.(member);
  };

  const onProject = (project) => {
    console.log("project:created", project);
    onProjectCreated?.(project);
  };

  const onProjectDeletedLocal = (project) => {
    console.log("project:deleted", project);
    onProjectDeleted?.(project);
  };

  const onProjectUpdatedLocal = (project) => {
    console.log("project:updated", project);
    onProjectUpdated?.(project);
  };

  s.on("connect", onConnect);
  s.on("disconnect", onDisconnect);
  s.on("connect_error", onConnectErr);
  s.on("server:notify", onServerNotify);
  s.on("team-member:created", onTeam);
  s.on("project:created", onProject);
  s.on("project:deleted", onProjectDeletedLocal);
  s.on("project:updated", onProjectUpdatedLocal);
  s.on("pong:server", onPong);

  return () => {
    s.off("connect", onConnect);
    s.off("disconnect", onDisconnect);
    s.off("connect_error", onConnectErr);
    s.off("server:notify", onServerNotify);
    s.off("team-member:created", onTeam);
    s.off("project:created", onProject);
    s.off("project:deleted", onProjectDeletedLocal);
    s.off("project:updated", onProjectUpdatedLocal);
    s.off("pong:server", onPong);
  };
}