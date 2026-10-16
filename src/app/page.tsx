import Image from "next/image";
import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { projects } from "@/lib/projects";

export default function HomePage() {
  const featured =
    projects.find((p) => p.slug === "despues-del-fuego") ?? projects[0];

  return (
    <>
      <section className="hero" aria-label="Portada Autobuzz">
        <div className="hero-media">
          <Image
            src={featured.images[0] || featured.cover}
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-veil" />
        </div>
        <div className="hero-copy">
          <h1 className="hero-brand">
            ΛUTO<em>BUZZ</em>
          </h1>
          <p className="hero-lead">
            Colectivo de creación sonovisual. Instalaciones, intervenciones y
            máquinas que escuchan el espacio.
          </p>
          <div className="cta-row">
            <Link href="#obras" className="btn btn-primary">
              Ver obras
            </Link>
            <Link href="/armador" className="btn btn-ghost">
              Armador de proyectos
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="obras">
        <div className="section-head">
          <h2>Obras</h2>
          <p>
            Galerías y descripciones tomadas del archivo Autobuzz: ruido,
            materia, algoritmos y lugares habitados.
          </p>
        </div>
        <div className="work-grid">
          {projects.map((project, index) => (
            <WorkCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <footer className="site-footer">
        ΛUTOBUZZ · archivo vivo ·{" "}
        <Link href="/referencias">Referencias</Link>
        {" · "}
        <Link href="/marco">Marco</Link>
        {" · "}
        <Link href="/armador">Armador</Link>
        {" · "}
        <Link href="/ia">IA</Link>
      </footer>
    </>
  );
}
