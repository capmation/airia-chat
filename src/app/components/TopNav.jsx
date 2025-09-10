import { useEffect, useState } from "react";

export default function TopNav({
  wsStatus = "disconnected", // 'connected' | 'connecting' | 'disconnected'
  authed = false,
  onLogout = () => {}
}) {
  const [open, setOpen] = useState(false);

  // Close the menu when pressing ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll while the off-canvas is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original || "";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Dot color for websocket status
  const statusDot =
    wsStatus === "connected"
      ? "bg-green-500"
      : wsStatus === "connecting"
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <>
      {/* Top bar (fixed) */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 "
        aria-label="Global"
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex h-12 items-center justify-between">
            {/* Circular toggle button ("bolita") */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-menu"
              aria-expanded={open}
              aria-label={open ? "Close main menu" : "Open main menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 ring-1 ring-gray-200 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {/* Hamburger icon */}
              <svg
                className={`h-6 w-6 ${open ? "hidden" : "block"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close (X) icon */}
              <svg
                className={`h-6 w-6 ${open ? "block" : "hidden"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Dim overlay (click to close) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Off-canvas sidebar (slides in from left) */}
      <aside
        id="mobile-menu"
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-gray-800
          transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b bg-white border-gray-200">
          <div className="m-auto">
            <img
              className="w-[200px] m-auto"
              alt="Capmation logo"
              src="/capmation-agents-logo.png"
            />
          </div>
        </div>

        {/* Sidebar content (full height with scroll if needed) */}
        <div className="flex h-[calc(100vh-100px)] flex-col overflow-y-auto px-4 py-3">
          {/* Example nav items — replace with your own */}
          <nav className="space-y-2 text-sm">
            <a href="#" onClick={() => setOpen((v) => !v)} className="block rounded-md px-3 py-2 hover:bg-gray-100">
              Capmation Projects Agent
            </a>
          </nav>

          {/* Footer actions (sticks to bottom) */}
          <div className="mt-auto pt-2 border-t border-gray-200">

          <div className="flex items-center justify-center gap-2 pb-2" title={`WebSocket: ${wsStatus}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${statusDot}`} aria-hidden="true" />
            <span className="text-xs text-gray-600">WS: {wsStatus}</span>
            <span role="img" aria-label={authed ? "Authenticated" : "Guest"}>
              {authed ? "🔒" : "🔓"}
            </span>
          </div>
            <button
              onClick={onLogout}
              className="w-full rounded-md bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-400/40 hover:bg-blue-500/20"
            >
              Logout
            </button>            
          </div>
        </div>
      </aside>
    </>
  );
}
