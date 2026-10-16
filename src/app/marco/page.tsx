import type { Metadata } from "next";
import { IdeasMarco } from "@/components/IdeasMarco";
import { getMetodologia } from "@/lib/studio-store";

export const metadata: Metadata = {
  title: "Ideas y marco",
  description:
    "Metodología, ideas y marco teórico del colectivo Autobuzz.",
};

export default function MarcoPage() {
  const metodologia = getMetodologia();

  return (
    <div className="page-shell wide studio-page">
      <header className="studio-intro">
        <p className="eyebrow">Estudio</p>
        <h1>Ideas y marco teórico</h1>
        <p>
          Acá se formula cómo trabajamos: la metodología extraída de piezas como{" "}
          <em>después del fuego</em>, las ideas propias y el marco que sostiene
          las propuestas.
        </p>
      </header>
      <IdeasMarco metodologia={metodologia} />
    </div>
  );
}
