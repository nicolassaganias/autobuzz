import type { Metadata } from "next";
import { ArmadorChat } from "@/components/ArmadorChat";

export const metadata: Metadata = {
  title: "Armador",
  description:
    "Asistente para maquetar propuestas Autobuzz cruzando metodología, marco, referencias y convocatorias.",
};

export default function ArmadorPage() {
  return (
    <div className="page-shell wide studio-page armador-page">
      <header className="studio-intro">
        <p className="eyebrow">Estudio</p>
        <h1>Armador de proyectos</h1>
        <p>
          Entiende la metodología Autobuzz, la cruza con el marco teórico, el
          banco de referencias y las bases de una convocatoria, y ayuda a
          maquetar propuestas.
        </p>
      </header>
      <ArmadorChat />
    </div>
  );
}
