import type { Metadata } from "next";
import { AutobuzzChat } from "@/components/AutobuzzChat";

export const metadata: Metadata = {
  title: "AutobuzzIA",
  description:
    "Guía conversacional del archivo Autobuzz, impulsada por Gemini.",
};

export default function IaPage() {
  return (
    <div className="ia-page">
      <div className="ia-intro">
        <h1>AutobuzzIA</h1>
        <p>
          Una guía del archivo sonoro. Preguntá por instalaciones, materiales,
          residencias o pedí un recorrido — como NEXT en CICLIC, pero con la
          memoria de Autobuzz.
        </p>
      </div>
      <AutobuzzChat />
    </div>
  );
}
