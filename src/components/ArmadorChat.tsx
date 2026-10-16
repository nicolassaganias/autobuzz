"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useMemo, useRef, useState } from "react";

const suggestions = [
  "Armá una maqueta de propuesta partiendo de un fenómeno del entorno urbano",
  "Cruzá nuestra metodología con las bases que pegamos a la izquierda",
  "Proponé un título, abstract y materiales para una instalación en residencia",
  "¿Qué referencias del banco encajan con una convocatoria sobre territorio?",
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

export function ArmadorChat() {
  const [input, setInput] = useState("");
  const [convocatoria, setConvocatoria] = useState("");
  const convocatoriaRef = useRef(convocatoria);
  convocatoriaRef.current = convocatoria;
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/armador",
        body: () => ({ convocatoria: convocatoriaRef.current }),
      }),
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
    <div className="armador-layout">
      <aside className="convocatoria-panel">
        <h2>Bases de convocatoria</h2>
        <p>
          Pegá acá el texto de la convocatoria. El Armador lo cruza con la
          metodología, el marco teórico y el banco de referencias.
        </p>
        <textarea
          value={convocatoria}
          onChange={(event) => setConvocatoria(event.target.value)}
          rows={16}
          placeholder="Pegá bases, ejes, requisitos, fechas, perfil de proyecto…"
        />
        <p className="hint">
          {convocatoria.trim()
            ? `${convocatoria.trim().length} caracteres listos para cruzar.`
            : "Sin bases todavía: el Armador igual puede maquetar desde la metodología."}
        </p>
      </aside>

      <div className="chat-panel armador-chat">
        <div className="chat-log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="bubble system">
              Soy el Armador. Traé un fenómeno, una idea o una convocatoria y
              armamos una maqueta de propuesta Autobuzz.
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

          {busy ? <div className="bubble system">armando…</div> : null}
          {error ? (
            <div className="bubble system">
              No pude responder ahora. Revisá que GEMINI_API_KEY esté
              configurada.
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
            placeholder="Pedí una maqueta, un abstract, materiales…"
            aria-label="Mensaje para el Armador"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
