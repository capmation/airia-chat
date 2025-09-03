import { useState, useRef } from "react";
import { api } from "./lib/api";

/* Tries to parse strings that look like JSON; also parses nested JSON inside "Value" */
function parseMaybeJSON(value) {
  if (typeof value !== "string") return value;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.Value === "string") {
      try {
        parsed.Value = JSON.parse(parsed.Value);
      } catch {
        /* ignore nested parse errors */
      }
    }
    return parsed;
  } catch {
    return value; // Not JSON, return as-is
  }
}

/* Summarize a single pipeline step into a displayable string */
function summarizeStep(step) {
  const label = step?.stepType || "Step";
  const out = parseMaybeJSON(step?.output);

  if (typeof out === "string") {
    return out.trim();
  }

  const key = out?.Key ? ` ${String(out.Key)}` : "";
  const value = out?.Value;

  if (value && typeof value === "object") {
    const textParts = Array.isArray(value.content)
      ? value.content
          .filter((c) => c?.type === "text" && c?.text)
          .map((c) => c.text)
      : [];
    const status = value.isError ? "(error)" : "(ok)";
    if (textParts.length > 0) {
      return `[${label}]${key} ${status}\n${textParts.join("\n")}`;
    }
    return `[${label}]${key} ${status}`;
  }

  // Fallback: pretty-print the object
  return `[${label}] ${JSON.stringify(out, null, 2)}`;
}

/* Normalizes various backend response shapes into an array of assistant message strings */
function extractAssistantMessages(data) {
  try {
    // 1) Plain string
    if (typeof data === "string") return [data];

    // 2) Old shape: { result: "..." }
    if (typeof data?.result === "string") return [data.result];

    // 3) OpenAI-like shape
    const openAI = data?.choices?.[0]?.message?.content;
    if (openAI) return [openAI];

    // 4) New pipeline shape: { $type: "objectArray", result: [ ...steps ] }
    if (Array.isArray(data?.result)) {
      return data.result
        .map((step) => summarizeStep(step))
        .filter((t) => t && t.length > 0);
    }

    // 5) Ultimate fallback: pretty-print whole payload
    return [JSON.stringify(data, null, 2)];
  } catch {
    return [typeof data === "string" ? data : JSON.stringify(data)];
  }
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  async function sendMessage() {
    if (loading || !input.trim()) return;

    const content = input.trim();
    const userMsg = { role: "user", content };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/agent/chat", { text: content });

      // Get one-or-many assistant messages depending on payload shape
      const assistantTexts = extractAssistantMessages(res?.data);

      // Push each step as its own bubble
      setMessages((prev) => [
        ...prev,
        ...assistantTexts.map((t) => ({ role: "assistant", content: t })),
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to Airia" },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto bg-white rounded-lg shadow h-[100%] p-4 mt-16">
      <div className="text-center p-4">
        <img
          className="w-1/4 m-auto"
          alt="Capmation logo"
          src="https://apps.capmation.com/img/ZCapmation_Theme.Capmation_Logo_Changing_Lives.jpg?YrsnXGDXqL5scmYSYM410g"
        />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-yellow-50 text-right"
                : "bg-gray-100 text-left"
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
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="btn-primary"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
