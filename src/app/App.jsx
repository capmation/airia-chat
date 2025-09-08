// src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import Login from "./components/Login"; 

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!localStorage.getItem("token"));
  }, []);

  return (
    <div className="h-screen items-center justify-center bg-amber-50">
      <div className="h-screen sm:h-7/8 flex items-center justify-center">
        {authed ? (
          <Chat />
        ) : (
          <Login onLoggedIn={() => setAuthed(true)} />
        )}
      </div>
    </div>
  );
}
