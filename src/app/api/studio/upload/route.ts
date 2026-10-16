import { NextResponse } from "next/server";
import { uploadStudioImage } from "@/lib/studio-store";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Falta el archivo" },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Solo se aceptan imágenes" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "La imagen supera 8MB" },
        { status: 400 },
      );
    }
    const uploaded = await uploadStudioImage(file);
    return NextResponse.json({ ok: true, ...uploaded });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo subir",
      },
      { status: 400 },
    );
  }
}
