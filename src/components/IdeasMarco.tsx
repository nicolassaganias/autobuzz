"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type NoteKind = "idea" | "marco" | "metodologia";

type StudioNote = {
  id: string;
  kind: NoteKind;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  source: "user" | "seed";
};

type Metodologia = {
  title: string;
  summary: string;
  ejemploCanonico: {
    obra: string;
    slug: string;
    contexto: string;
    pasos: string[];
  };
  ciclo: Array<{ id: string; nombre: string; descripcion: string }>;
};

const kindLabels: Record<NoteKind, string> = {
  idea: "Idea",
  marco: "Marco",
  metodologia: "Metodología",
};

export function IdeasMarco({ metodologia }: { metodologia: Metodologia }) {
  const [entries, setEntries] = useState<StudioNote[]>([]);
  const [mode, setMode] = useState("local");
  const [kind, setKind] = useState<NoteKind>("idea");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"all" | NoteKind>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/studio/notes", { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "No se pudo cargar");
    setEntries(data.entries);
    setMode(data.mode);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title, content, tags }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setTitle("");
      setContent("");
      setTags("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusy(false);
    }
  }

  const visible =
    view === "all" ? entries : entries.filter((entry) => entry.kind === view);

  return (
    <div className="studio-stack">
      <section className="method-panel">
        <p className="eyebrow">Método de trabajo</p>
        <h2>{metodologia.title}</h2>
        <p className="method-summary">{metodologia.summary}</p>

        <div className="cycle-grid">
          {metodologia.ciclo.map((paso, index) => (
            <article key={paso.id} className="cycle-step">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{paso.nombre}</h3>
              <p>{paso.descripcion}</p>
            </article>
          ))}
        </div>

        <div className="canon-block">
          <h3>
            Ejemplo canónico:{" "}
            <em>{metodologia.ejemploCanonico.obra}</em>
          </h3>
          <p>{metodologia.ejemploCanonico.contexto}</p>
          <ol>
            {metodologia.ejemploCanonico.pasos.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
        </div>
      </section>

      <div className="studio-layout">
        <form className="studio-form" onSubmit={onSubmit}>
          <div className="studio-form-head">
            <h2>Sumar idea o marco</h2>
            <p>
              Acá viven las ideas propias y el marco teórico que alimenta al
              Armador. Memoria: {mode === "blob" ? "Blob" : "local"}.
            </p>
          </div>

          <div className="kind-tabs" role="tablist">
            {(["idea", "marco", "metodologia"] as NoteKind[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={kind === item}
                className={kind === item ? "active" : undefined}
                onClick={() => setKind(item)}
              >
                {kindLabels[item]}
              </button>
            ))}
          </div>

          <label>
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Ej. Escucha como descubrimiento"
            />
          </label>

          <label>
            Contenido
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={6}
              placeholder="Desarrollá la idea o el marco…"
            />
          </label>

          <label>
            Tags
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="escucha, espacio, naturaleza…"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn btn-ink" type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar en el estudio"}
          </button>
        </form>

        <section className="studio-rail">
          <div className="studio-rail-head">
            <h2>Archivo ({visible.length})</h2>
            <div className="filter-row">
              {(["all", "idea", "marco", "metodologia"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={view === item ? "chip active" : "chip"}
                  onClick={() => setView(item)}
                >
                  {item === "all" ? "Todo" : kindLabels[item]}
                </button>
              ))}
            </div>
          </div>

          <ul className="note-list">
            {visible.map((entry) => (
              <li key={entry.id} className="note-item">
                <div className="ref-meta">
                  <span className="ref-kind">{kindLabels[entry.kind]}</span>
                  {entry.source === "user" ? (
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => remove(entry.id)}
                      disabled={busy}
                    >
                      borrar
                    </button>
                  ) : (
                    <span className="seed-badge">semilla</span>
                  )}
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.content}</p>
                {entry.tags.length ? (
                  <div className="tag-row">
                    {entry.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
