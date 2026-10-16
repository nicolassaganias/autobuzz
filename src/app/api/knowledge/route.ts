import { NextResponse } from "next/server";
import { addKnowledge, listKnowledge, storageMode } from "@/lib/knowledge-store";

export const runtime = "nodejs";

export async function GET() {
  const entries = await listKnowledge();
  return NextResponse.json({ ok: true, mode: storageMode(), entries });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const saved = await addKnowledge({
      title: String(body.title ?? ""),
      content: String(body.content ?? ""),
      relatedSlug: body.relatedSlug ? String(body.relatedSlug) : undefined,
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
