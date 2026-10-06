import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/autobuzz-system";

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

  // Ensure @ai-sdk/google picks up the key even if only GEMINI_API_KEY is set.
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  }

  const body = await req.json();
  const messages = (body.messages ?? []) as UIMessage[];

  const result = streamText({
    // Free-tier friendly Flash model
    model: google("gemini-2.5-flash"),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
