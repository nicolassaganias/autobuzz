"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useMemo, useRef, useState } from "react";

const suggestions = [
  "¿Qué es Autobuzz?",
  "Contame sobre Campanas",
  "¿Qué obras hicieron en el monte chaqueño?",
  "Armame un recorrido por las instalaciones",
];

function messageText(message: {
  role: string;
  parts?: Array<{ type: string; text?: string }>;
  content?: string | Array<{ type: string; text?: string }>;
}) {
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n");
  }
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n");
  }
  return "";
}

export function AutobuzzChat() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";

  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    await sendMessage({ text: trimmed });
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await submitText(input);
  }

  return (
    <div className="chat-panel">
      <div className="chat-log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="bubble system">
            Soy AutobuzzIA. Preguntame por las obras, materiales, contextos o
            pedime un recorrido por el archivo.
          </div>
        ) : null}

        {messages.map((message) => {
          const text = messageText(message);
          if (!text) return null;
          return (
            <div
              key={message.id}
              className={`bubble ${message.role === "user" ? "user" : "assistant"}`}
            >
              {text}
            </div>
          );
        })}

        {busy ? <div className="bubble system">escuchando…</div> : null}
        {error ? (
          <div className="bubble system">
            No pude responder ahora. Revisá que GEMINI_API_KEY esté configurada.
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 ? (
        <div className="suggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              onClick={() => submitText(item)}
              disabled={busy}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <form className="composer" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí tu pregunta…"
          aria-label="Mensaje para AutobuzzIA"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
