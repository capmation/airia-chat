import { useState } from "react";

export default function TopNav({
  wsStatus = "disconnected", // 'connected' | 'connecting' | 'disconnected'
  authed = false,
  onLogout = () => {},
  brand = "Capmation Agents",
}) {
  const [open, setOpen] = useState(false);

  const statusDot =
    wsStatus === "connected"
      ? "bg-green-500"
      : wsStatus === "connecting"
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 bg-white text-gray-800 shadow"
      aria-label="Global"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 ring-1 ring-amber-400/30 text-amber-300 font-bold">
              A
            </span>
            <a href="#" className="text-sm font-semibold tracking-wide">
              {brand}
            </a>
          </div>

          {/* Right (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <div
              className="flex items-center gap-2"
              title={`WebSocket: ${wsStatus}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusDot}`}
                aria-hidden="true"
              />
              <span className="text-xs opacity-80">WS: {wsStatus}</span>
              <span role="img" aria-label={authed ? "Authenticated" : "Guest"}>
                {authed ? "🔒" : "🔓"}
              </span>
            </div>

            {authed && (
              <button
                onClick={onLogout}
                className="rounded-md bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-950 ring-1 ring-inset ring-blue-400/30 hover:bg-blue-500/20"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-menu"
              aria-expanded={open}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger */}
              <svg
                className={`h-6 w-6 ${open ? "hidden" : "block"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* X */}
              <svg
                className={`h-6 w-6 ${open ? "block" : "hidden"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={`md:hidden ${open ? "block" : "hidden"} border-t border-white/10`}
      >
        <div className="space-y-2 px-4 pb-3 pt-2">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2"
              title={`WebSocket: ${wsStatus}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusDot}`}
                aria-hidden="true"
              />
              <span className="text-xs opacity-80">WS: {wsStatus}</span>
              <span role="img" aria-label={authed ? "Authenticated" : "Guest"}>
                {authed ? "🔒" : "🔓"}
              </span>
            </div>

            {authed && (
              <button
                onClick={onLogout}
                className="rounded-md bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-300 ring-1 ring-inset ring-amber-400/30 hover:bg-amber-500/20"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
