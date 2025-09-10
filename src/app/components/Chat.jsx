import { useState, useRef, useLayoutEffect, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks"; // single line breaks => <br/>
import { api } from "../../utils/api";
import { subscribe } from "../../utils/bus";

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
  const [messages, setMessages] = useState([
    { role: "assistant", 
      content: `👋 **Welcome to Capmation Agents!** 
      Ask me about your projects or teammates. I can **create new projects, enroll team members into your projects, send emails and search the repository for best practice files**. 
      What would you like to do today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);   

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

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
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  }

  useEffect(() => {
    const unsubscribe = subscribe("team-member:created", (member) => {
      const pretty =
        `👤 Real time Notification!! - Admin add a new team member:\n` +
        `• Name: ${member.name} ${member.lastname}\n` +
        `• Email: ${member.email}\n` +
        `• Position: ${member.position ?? "—"}\n` +
        `• Allocated: ${member.allocated ? "Yes" : "No"}\n` +
        `• ID: ${member.id}`;

      setMessages((prev) => [
        ...prev,
        { role: "system", content: pretty, payload: member },
      ]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe("project:created", (project) => {
      const pretty =
        `👤 Real time Notification!! - Admin add a new Project:\n` +
        `• Name: ${project.name}\n` +
        `• ID: ${project.id}`; 

      setMessages((prev) => [
        ...prev,
        { role: "system", content: pretty, payload: project },
      ]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe("project:deleted", (project) => {
      const pretty =
        `👤 Real time Notification!! - Admin delete the Project:\n` +
        `• Name: ${project.name}\n` +
        `• ID: ${project.id}`;

      setMessages((prev) => [
        ...prev,
        { role: "system", content: pretty, payload: project },
      ]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe("project:updated", (project) => {
      const pretty =
        `👤 Real time Notification!! - Admin add a update the Project:\n` +
        `• Name: ${project.name}\n` +
        `• ID: ${project.id}`;

      setMessages((prev) => [
        ...prev,
        { role: "system", content: pretty, payload: project },
      ]);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col w-full sm:w-[90%] max-w-[800px] mx-auto bg-white rounded-lg shadow h-[100%] sm:py-4 sm:mt-16">
      <div className="text-center p-4">
        <img
          className="w-1/2 sm:w-1/4 m-auto"
          alt="Capmation logo"
          src="/capmation-agents-logo.png"
        />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pt-5">
        {messages.map((m, i) => (
          <div key={i} className={`message-row w-[90%] sm:w-full
                  animate-fade-in-up will-change-transform motion-reduce:animate-none 
                  ${
                    m.role === "user"
                      ? "text-right pr-5 me"
                      : "text-left pl-4 ai"
                  }`}>
            <div className={`${
                m.role === "user"
                  ? ""
                  : "flex"
              }`}>

              {m.role === "user"
                ? <></>
                : <img
                    className="w-[40px] h-[40px] mr-3 -top-4.5 relative"
                    alt="ia-icon"
                    src="/capmation-ai-icon.png"
                  />
              }
              
              <div
                key={i}
                className={`message max-w-[90%] text-left p-4 rounded whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-yellow-100"
                    : "bg-gray-100"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}                
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400 flex justify-center items-center animate-fade-in-up will-change-transform motion-reduce:animate-none ">
          <img src="/thinkingRobot.png" className="w-[60px] mr-2" />
          Thinking…
        </div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex mt-2 gap-2 px-4 pb-5 sm:pb-0">
        <input
          className="flex-1 border px-3 py-2 rounded border-primary"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="btn-primary"
          disabled={loading || !input.trim()}
        >
          <img src="/send.svg" className="w-[20px]" />
        </button>
      </div>
    </div>
  );
}
