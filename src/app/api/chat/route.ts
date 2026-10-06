import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/autobuzz-system";
import { addKnowledge, listKnowledge, storageMode } from "@/lib/knowledge-store";

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

  const result = streamText({
    model: google("gemini-flash-lite-latest"),
    system: await buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
    stopWhen: stepCountIs(3),
    tools: {
      guardar_dato_autobuzz: tool({
        description:
          "Guarda un dato nuevo sobre Autobuzz (obra, fecha, material, anécdota, link, crédito) en la memoria persistente del sitio.",
        inputSchema: z.object({
          title: z.string().min(3).describe("Título corto del dato"),
          content: z.string().min(5).describe("Contenido completo a recordar"),
          relatedSlug: z
            .string()
            .optional()
            .describe("Slug de obra relacionada, si aplica"),
        }),
        execute: async ({ title, content, relatedSlug }) => {
          const saved = await addKnowledge({ title, content, relatedSlug });
          return {
            ok: true,
            mode: saved.mode,
            entry: saved.entry,
            message:
              saved.mode === "blob"
                ? "Dato guardado en memoria persistente (Vercel Blob)."
                : "Dato guardado en knowledge-extra.json del proyecto. En Vercel, activá Blob para que persista entre deploys.",
          };
        },
      }),
      listar_datos_guardados: tool({
        description: "Lista los datos extra ya guardados por el chat.",
        inputSchema: z.object({}),
        execute: async () => {
          const entries = await listKnowledge();
          return {
            ok: true,
            mode: storageMode(),
            count: entries.length,
            entries: entries.slice(0, 30),
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
