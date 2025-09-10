import { useEffect, useRef, useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import Login from "./components/Login";
import TopNav from "./components/TopNav";
import { publish } from "../utils/bus";

import { connectSocket, getSocket, wireSocket } from "../utils/socket";
import { handleLoggedIn as authHandleLoggedIn, handleLogout as authHandleLogout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const socketRef = useRef(null);
  const cleanupRef = useRef(null);

  // Auto-connect WS on mount if token exists
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setAuthed(true);
      const s = connectSocket({
        token: t,
        url: import.meta.env.VITE_WS_URL || "http://localhost:8787",
        path: import.meta.env.VITE_WS_PATH || "/socket.io",
      });
      socketRef.current = s;

      cleanupRef.current?.();
      cleanupRef.current = wireSocket(s, {
        setWsStatus,
        onTeamCreated: (member) => publish("team-member:created", member),
        onProjectCreated: (project) => publish("project:created", project),
        onProjectDeleted: (project) => publish("project:deleted", project),
        onProjectUpdated: (project) => publish("project:updated", project),
      });
    }

    return () => {
      try {
        cleanupRef.current?.();
        getSocket().disconnect();
      } catch { /* empty */ }
      socketRef.current = null;
      setWsStatus("disconnected");
    };
  }, []);

  // Delegate to utils/auth.js
  function handleLoggedIn() {
    authHandleLoggedIn({
      setAuthed,
      setWsStatus,
      socketRef,
      cleanupRef,
      onTeamCreated: (member) => publish("team-member:created", member),
      onProjectCreated: (project) => publish("project:created", project),
      onProjectDeleted: (project) => publish("project:deleted", project),
      onProjectUpdated: (project) => publish("project:updated", project),
      wsUrl: import.meta.env.VITE_WS_URL || "http://localhost:8787",
      wsPath: import.meta.env.VITE_WS_PATH || "/socket.io",
    });
  }

  function handleLogout() {
    authHandleLogout({
      setAuthed,
      setWsStatus,
      socketRef,
      cleanupRef,
    });
  }

  return (
    <div className="h-screen items-center justify-center bg-amber-50">
      <div className="h-screen sm:h-7/8 flex flex-col items-center justify-center">
        {authed ? (
          <div>
            <TopNav
              wsStatus={wsStatus}
              authed={authed}
              onLogout={handleLogout}
              brand="Capmation Agents"
            />
            <main className="pt-6 sm:pt-20 h-[100vh] sm:h-[calc(100vh-3.5rem)] flex items-center justify-center">
              <Chat />
            </main>
          </div>
        ) : (
          <Login onLoggedIn={handleLoggedIn} />
        )}
      </div>
    </div>
  );
}
