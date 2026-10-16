import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { buildArmadorSystemPrompt } from "@/lib/armador-system";
import {
  addNote,
  addReference,
  listNotes,
  listReferences,
  storageMode,
} from "@/lib/studio-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function resolveApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  );
}

export async function POST(req: Request) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Falta GEMINI_API_KEY. Creá una key gratuita en https://aistudio.google.com/apikey y agregala en Vercel / .env.local",
      },
      { status: 500 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  }

  const body = await req.json();
  const messages = (body.messages ?? []) as UIMessage[];
  const convocatoria =
    typeof body.convocatoria === "string" ? body.convocatoria : "";

  const result = streamText({
    model: google("gemini-flash-lite-latest"),
    system: await buildArmadorSystemPrompt(convocatoria),
    messages: await convertToModelMessages(messages),
    temperature: 0.65,
    stopWhen: stepCountIs(3),
    tools: {
      guardar_referencia_autobuzz: tool({
        description:
          "Guarda una referencia (texto o link) en el banco de referencias de Autobuzz.",
        inputSchema: z.object({
          kind: z.enum(["text", "link"]).describe("Tipo de referencia"),
          title: z.string().min(3),
          content: z.string().optional().describe("Notas o texto"),
          url: z.string().optional().describe("URL si es link"),
          tags: z.array(z.string()).optional(),
        }),
        execute: async ({ kind, title, content, url, tags }) => {
          const saved = await addReference({
            kind,
            title,
            content,
            url,
            tags,
          });
          return {
            ok: true,
            mode: saved.mode,
            entry: saved.entry,
          };
        },
      }),
      guardar_nota_estudio: tool({
        description:
          "Guarda una idea o nota de marco teórico en el estudio Autobuzz.",
        inputSchema: z.object({
          kind: z.enum(["idea", "marco", "metodologia"]),
          title: z.string().min(3),
          content: z.string().min(5),
          tags: z.array(z.string()).optional(),
        }),
        execute: async ({ kind, title, content, tags }) => {
          const saved = await addNote({ kind, title, content, tags });
          return { ok: true, mode: saved.mode, entry: saved.entry };
        },
      }),
      listar_estudio: tool({
        description:
          "Lista referencias y notas del estudio (ideas / marco / metodología).",
        inputSchema: z.object({}),
        execute: async () => {
          const [references, notes] = await Promise.all([
            listReferences(),
            listNotes(),
          ]);
          return {
            ok: true,
            mode: storageMode(),
            references: references.slice(0, 40),
            notes: notes.slice(0, 40),
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
