"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type ReferenceKind = "text" | "image" | "link";

type StudioReference = {
  id: string;
  kind: ReferenceKind;
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
};

const kindLabels: Record<ReferenceKind, string> = {
  text: "Texto",
  image: "Imagen",
  link: "Link",
};

export function ReferenceBank() {
  const [entries, setEntries] = useState<StudioReference[]>([]);
  const [mode, setMode] = useState("local");
  const [kind, setKind] = useState<ReferenceKind>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ReferenceKind>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/studio/references", { cache: "no-store" });
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
      let imageUrl: string | undefined;
      if (kind === "image" && file) {
        const form = new FormData();
        form.append("file", file);
        const uploadRes = await fetch("/api/studio/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.ok) throw new Error(uploadData.error);
        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/studio/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          content,
          url: kind === "link" ? url : url || undefined,
          imageUrl: imageUrl || (kind === "image" ? url : undefined),
          tags,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setTitle("");
      setContent("");
      setUrl("");
      setTags("");
      setFile(null);
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
      const res = await fetch("/api/studio/references", {
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
    filter === "all" ? entries : entries.filter((entry) => entry.kind === filter);

  return (
    <div className="studio-layout">
      <form className="studio-form" onSubmit={onSubmit}>
        <div className="studio-form-head">
          <h2>Sumar referencia</h2>
          <p>
            Tirás textos, imágenes o links y se van componiendo el banco de
            Autobuzz. Memoria: {mode === "blob" ? "Blob" : "local"}.
          </p>
        </div>

        <div className="kind-tabs" role="tablist" aria-label="Tipo de referencia">
          {(["text", "image", "link"] as ReferenceKind[]).map((item) => (
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
            placeholder="Ej. Luciérnagas / campo electromagnético"
          />
        </label>

        {kind === "text" ? (
          <label>
            Texto
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={5}
              placeholder="Cita, apunte, fragmento…"
            />
          </label>
        ) : null}

        {kind === "link" ? (
          <>
            <label>
              URL
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
                placeholder="https://"
              />
            </label>
            <label>
              Notas
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={3}
                placeholder="Por qué importa esta referencia"
              />
            </label>
          </>
        ) : null}

        {kind === "image" ? (
          <>
            <label>
              Subir imagen
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <label>
              o URL de imagen
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
              />
            </label>
            <label>
              Notas
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={3}
                placeholder="Qué miramos acá"
              />
            </label>
          </>
        ) : null}

        <label>
          Tags
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="naturaleza, eco, luz…"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-ink" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Archivar en el banco"}
        </button>
      </form>

      <section className="studio-rail">
        <div className="studio-rail-head">
          <h2>Banco ({visible.length})</h2>
          <div className="filter-row">
            {(["all", "text", "image", "link"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "chip active" : "chip"}
                onClick={() => setFilter(item)}
              >
                {item === "all" ? "Todo" : kindLabels[item]}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="empty-hint">
            Todavía vacío. Empezá tirando una cita, un link o una imagen.
          </p>
        ) : (
          <ul className="ref-list">
            {visible.map((entry) => (
              <li key={entry.id} className="ref-item">
                <div className="ref-meta">
                  <span className="ref-kind">{kindLabels[entry.kind]}</span>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => remove(entry.id)}
                    disabled={busy}
                  >
                    borrar
                  </button>
                </div>
                <h3>{entry.title}</h3>
                {entry.kind === "image" && entry.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.imageUrl} alt={entry.title} />
                ) : null}
                {entry.url ? (
                  <a href={entry.url} target="_blank" rel="noreferrer">
                    {entry.url}
                  </a>
                ) : null}
                {entry.content ? <p>{entry.content}</p> : null}
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
        )}
      </section>
    </div>
  );
}
