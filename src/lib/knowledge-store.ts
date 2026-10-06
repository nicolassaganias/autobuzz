import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  relatedSlug?: string;
  createdAt: string;
  source: "chat" | "seed";
};

const BLOB_PATHNAME = "autobuzz/knowledge.json";
const LOCAL_FILE = path.join(process.cwd(), "src/data/knowledge-extra.json");

type KnowledgeFile = {
  entries: KnowledgeEntry[];
};

function emptyStore(): KnowledgeFile {
  return { entries: [] };
}

async function readLocalFile(): Promise<KnowledgeFile> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as KnowledgeFile;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return emptyStore();
  }
}

async function writeLocalFile(store: KnowledgeFile) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function readBlobStore(): Promise<KnowledgeFile | null> {
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
    const parsed = (await res.json()) as KnowledgeFile;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return emptyStore();
  }
}

async function writeBlobStore(store: KnowledgeFile) {
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

export function storageMode() {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

export async function listKnowledge(): Promise<KnowledgeEntry[]> {
  const blob = await readBlobStore();
  if (blob) return blob.entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const local = await readLocalFile();
  return local.entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addKnowledge(input: {
  title: string;
  content: string;
  relatedSlug?: string;
}): Promise<{ entry: KnowledgeEntry; mode: string }> {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) {
    throw new Error("title y content son obligatorios");
  }

  const entry: KnowledgeEntry = {
    id: `k_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    relatedSlug: input.relatedSlug?.trim() || undefined,
    createdAt: new Date().toISOString(),
    source: "chat",
  };

  const mode = storageMode();
  if (mode === "blob") {
    const store = (await readBlobStore()) ?? emptyStore();
    store.entries.push(entry);
    await writeBlobStore(store);
  } else {
    const store = await readLocalFile();
    store.entries.push(entry);
    await writeLocalFile(store);
  }

  return { entry, mode };
}

export async function knowledgePromptBlock() {
  const entries = await listKnowledge();
  if (!entries.length) {
    return "No hay datos extra guardados todavía.";
  }
  return entries
    .map((entry) => {
      const related = entry.relatedSlug ? ` (obra: ${entry.relatedSlug})` : "";
      return `- ${entry.title}${related}: ${entry.content}`;
    })
    .join("\n");
}
