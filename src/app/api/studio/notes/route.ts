import { NextResponse } from "next/server";
import {
  addNote,
  deleteNote,
  listNotes,
  storageMode,
  type NoteKind,
} from "@/lib/studio-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kindParam = searchParams.get("kind");
  const kind =
    kindParam && ["idea", "marco", "metodologia"].includes(kindParam)
      ? (kindParam as NoteKind)
      : undefined;
  const entries = await listNotes(kind);
  return NextResponse.json({ ok: true, mode: storageMode(), entries });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kind = String(body.kind ?? "idea") as NoteKind;
    const saved = await addNote({
      kind,
      title: String(body.title ?? ""),
      content: String(body.content ?? ""),
      tags: body.tags,
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo guardar",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await deleteNote(String(body.id ?? ""));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo borrar",
      },
      { status: 400 },
    );
  }
}
