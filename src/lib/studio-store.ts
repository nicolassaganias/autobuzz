import { put, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import seed from "@/data/studio-seed.json";

export type ReferenceKind = "text" | "image" | "link";

export type StudioReference = {
  id: string;
  kind: ReferenceKind;
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  source: "user" | "seed";
};

export type NoteKind = "idea" | "marco" | "metodologia";

export type StudioNote = {
  id: string;
  kind: NoteKind;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  source: "user" | "seed";
};

type StudioFile = {
  references: StudioReference[];
  notes: StudioNote[];
};

const BLOB_PATHNAME = "autobuzz/studio.json";
const LOCAL_FILE = path.join(process.cwd(), "src/data/studio-extra.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public/uploads");

function emptyStore(): StudioFile {
  return { references: [], notes: [] };
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function storageMode() {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

export function getMetodologia() {
  return seed.metodologia;
}

function seedNotes(): StudioNote[] {
  const marco = (seed.marcoTeorico ?? []).map((item) => ({
    id: item.id,
    kind: item.kind as NoteKind,
    title: item.title,
    content: item.content,
    tags: item.tags ?? [],
    createdAt: "2019-07-28T00:00:00.000Z",
    source: "seed" as const,
  }));
  const ideas = (seed.ideas ?? []).map((item) => ({
    id: item.id,
    kind: item.kind as NoteKind,
    title: item.title,
    content: item.content,
    tags: item.tags ?? [],
    createdAt: "2019-07-28T00:00:00.000Z",
    source: "seed" as const,
  }));
  return [...marco, ...ideas];
}

async function readLocalFile(): Promise<StudioFile> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as StudioFile;
    return {
      references: Array.isArray(parsed.references) ? parsed.references : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeLocalFile(store: StudioFile) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function readBlobStore(): Promise<StudioFile | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const listed = await list({
      prefix: BLOB_PATHNAME,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const blob = listed.blobs[0];
    if (!blob) return emptyStore();
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return emptyStore();
    const parsed = (await res.json()) as StudioFile;
    return {
      references: Array.isArray(parsed.references) ? parsed.references : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeBlobStore(store: StudioFile) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN no configurado");
  }
  await put(BLOB_PATHNAME, JSON.stringify(store, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    allowOverwrite: true,
  });
}

async function readStore(): Promise<StudioFile> {
  const blob = await readBlobStore();
  if (blob) return blob;
  return readLocalFile();
}

async function writeStore(store: StudioFile) {
  if (storageMode() === "blob") {
    await writeBlobStore(store);
  } else {
    await writeLocalFile(store);
  }
}

function normalizeTags(tags?: string[] | string) {
  if (!tags) return [] as string[];
  const list = Array.isArray(tags)
    ? tags
    : String(tags)
        .split(",")
        .map((tag) => tag.trim());
  return list.map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
}

export async function listReferences(): Promise<StudioReference[]> {
  const store = await readStore();
  return [...store.references].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function listNotes(kind?: NoteKind): Promise<StudioNote[]> {
  const store = await readStore();
  const seeded = seedNotes();
  const userIds = new Set(store.notes.map((note) => note.id));
  const merged = [
    ...store.notes,
    ...seeded.filter((note) => !userIds.has(note.id)),
  ];
  const filtered = kind ? merged.filter((note) => note.kind === kind) : merged;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addReference(input: {
  kind: ReferenceKind;
  title: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  tags?: string[] | string;
}): Promise<{ entry: StudioReference; mode: string }> {
  const kind = input.kind;
  const title = input.title.trim();
  const content = (input.content ?? "").trim();
  const url = input.url?.trim() || undefined;
  const imageUrl = input.imageUrl?.trim() || undefined;

  if (!title) throw new Error("El título es obligatorio");
  if (kind === "text" && !content) {
    throw new Error("Las referencias de texto necesitan contenido");
  }
  if (kind === "link" && !url) {
    throw new Error("Las referencias link necesitan una URL");
  }
  if (kind === "image" && !imageUrl && !url) {
    throw new Error("Las referencias imagen necesitan una imagen o URL");
  }

  const entry: StudioReference = {
    id: newId("ref"),
    kind,
    title,
    content,
    url: kind === "link" ? url : url,
    imageUrl: kind === "image" ? imageUrl || url : imageUrl,
    tags: normalizeTags(input.tags),
    createdAt: new Date().toISOString(),
    source: "user",
  };

  const store = await readStore();
  store.references.push(entry);
  await writeStore(store);
  return { entry, mode: storageMode() };
}

export async function addNote(input: {
  kind: NoteKind;
  title: string;
  content: string;
  tags?: string[] | string;
}): Promise<{ entry: StudioNote; mode: string }> {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) {
    throw new Error("title y content son obligatorios");
  }
  if (!["idea", "marco", "metodologia"].includes(input.kind)) {
    throw new Error("kind inválido");
  }

  const entry: StudioNote = {
    id: newId("note"),
    kind: input.kind,
    title,
    content,
    tags: normalizeTags(input.tags),
    createdAt: new Date().toISOString(),
    source: "user",
  };

  const store = await readStore();
  store.notes.push(entry);
  await writeStore(store);
  return { entry, mode: storageMode() };
}

export async function deleteReference(id: string) {
  const store = await readStore();
  const before = store.references.length;
  store.references = store.references.filter((entry) => entry.id !== id);
  if (store.references.length === before) {
    throw new Error("Referencia no encontrada");
  }
  await writeStore(store);
  return { ok: true as const, mode: storageMode() };
}

export async function deleteNote(id: string) {
  if (id.startsWith("seed_")) {
    throw new Error("Las notas semilla no se pueden borrar desde acá");
  }
  const store = await readStore();
  const before = store.notes.length;
  store.notes = store.notes.filter((entry) => entry.id !== id);
  if (store.notes.length === before) {
    throw new Error("Nota no encontrada");
  }
  await writeStore(store);
  return { ok: true as const, mode: storageMode() };
}

export async function uploadStudioImage(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const filename = `${Date.now().toString(36)}_${safeName || "ref.jpg"}`;

  if (storageMode() === "blob") {
    const blob = await put(`autobuzz/uploads/${filename}`, bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, mode: "blob" as const };
  }

  await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOADS, filename), bytes);
  return { url: `/uploads/${filename}`, mode: "local" as const };
}

export async function studioPromptBlock() {
  const metodologia = getMetodologia();
  const [references, notes] = await Promise.all([
    listReferences(),
    listNotes(),
  ]);

  const marco = notes.filter((note) => note.kind === "marco");
  const ideas = notes.filter((note) => note.kind === "idea");
  const metodologiaNotes = notes.filter((note) => note.kind === "metodologia");

  const refBlock = references.length
    ? references
        .map((ref) => {
          const bits = [
            `- [${ref.kind}] ${ref.title}`,
            ref.url ? `  url: ${ref.url}` : "",
            ref.imageUrl ? `  imagen: ${ref.imageUrl}` : "",
            ref.content ? `  notas: ${ref.content}` : "",
            ref.tags.length ? `  tags: ${ref.tags.join(", ")}` : "",
          ];
          return bits.filter(Boolean).join("\n");
        })
        .join("\n")
    : "No hay referencias cargadas todavía.";

  const noteBlock = (items: StudioNote[], empty: string) =>
    items.length
      ? items
          .map(
            (note) =>
              `- ${note.title}${note.tags.length ? ` (${note.tags.join(", ")})` : ""}: ${note.content}`,
          )
          .join("\n")
      : empty;

  return [
    "## Metodología Autobuzz",
    metodologia.summary,
    "",
    `Ejemplo canónico: ${metodologia.ejemploCanonico.obra} (${metodologia.ejemploCanonico.contexto})`,
    ...metodologia.ejemploCanonico.pasos.map((paso) => `- ${paso}`),
    "",
    "Ciclo de trabajo:",
    ...metodologia.ciclo.map(
      (paso) => `- ${paso.nombre}: ${paso.descripcion}`,
    ),
    metodologiaNotes.length
      ? `\nNotas de metodología:\n${noteBlock(metodologiaNotes, "")}`
      : "",
    "",
    "## Marco teórico",
    noteBlock(marco, "Todavía no hay notas de marco teórico."),
    "",
    "## Ideas",
    noteBlock(ideas, "Todavía no hay ideas cargadas."),
    "",
    "## Banco de referencias",
    refBlock,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export async function removeBlobIfNeeded(url: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  if (!url.includes("blob.vercel-storage.com") && !url.includes("public.blob")) {
    return;
  }
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // best effort
  }
}
