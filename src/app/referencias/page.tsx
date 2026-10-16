import type { Metadata } from "next";
import { ReferenceBank } from "@/components/ReferenceBank";

export const metadata: Metadata = {
  title: "Referencias",
  description: "Banco de referencias de Autobuzz: textos, imágenes y links.",
};

export default function ReferenciasPage() {
  return (
    <div className="page-shell wide studio-page">
      <header className="studio-intro">
        <p className="eyebrow">Estudio</p>
        <h1>Banco de referencias</h1>
        <p>
          Un archivo vivo para tirar citas, imágenes y links. Se va componiendo
          el mapa de referencias que después alimenta al Armador de proyectos.
        </p>
      </header>
      <ReferenceBank />
    </div>
  );
}
