import { NextResponse } from "next/server";
import {
  addReference,
  deleteReference,
  listReferences,
  storageMode,
  type ReferenceKind,
} from "@/lib/studio-store";

export const runtime = "nodejs";

export async function GET() {
  const entries = await listReferences();
  return NextResponse.json({ ok: true, mode: storageMode(), entries });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kind = String(body.kind ?? "text") as ReferenceKind;
    if (!["text", "image", "link"].includes(kind)) {
      return NextResponse.json(
        { ok: false, error: "kind debe ser text, image o link" },
        { status: 400 },
      );
    }
    const saved = await addReference({
      kind,
      title: String(body.title ?? ""),
      content: body.content ? String(body.content) : "",
      url: body.url ? String(body.url) : undefined,
      imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
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
    const result = await deleteReference(String(body.id ?? ""));
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
