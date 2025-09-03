import { useState } from "react";
import { api } from "./lib/api";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/agent/chat", {
        text: userMsg.content,
      });
      const assistantMsg = { role: "assistant", content: res.data.result };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to Airia" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto bg-white rounded-lg shadow h-[90%] p-4">
        <div class="text-center p-4">
          <img class="w-1/4 m-auto" src='https://apps.capmation.com/img/ZCapmation_Theme.Capmation_Logo_Changing_Lives.jpg?YrsnXGDXqL5scmYSYM410g'/>
        </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              m.role === "user" ? "bg-yellow-50 text-right" : "bg-gray-100 text-left"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400">Thinking…</div>}
      </div>
      <div className="flex mt-2 gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded border-primary"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="btn-primary"
        >
          Send
        </button>
      </div>
    </div>
  );
}