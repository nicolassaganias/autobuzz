import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects, youtubeId } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Obra" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const gallery = project.images.length ? project.images : [project.cover];

  return (
    <div className="page-shell wide">
      <Link href="/#obras" className="back-link">
        ← Índice
      </Link>

      <header className="project-hero">
        <div>
          <div className="project-kicker">
            {project.year ? <span>{project.year}</span> : null}
            {(project.tags ?? []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h1>{project.title}</h1>
          <p className="project-desc">{project.description}</p>
        </div>
      </header>

      <div className="gallery">
        {gallery.map((src) => (
          <Image
            key={src}
            src={src}
            alt={`${project.title} — imagen de archivo`}
            width={1600}
            height={1060}
            sizes="(max-width:900px) 100vw, 1100px"
          />
        ))}
      </div>

      {project.videos.length > 0 ? (
        <section>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              margin: "0 0 0.5rem",
            }}
          >
            Registro en video
          </h2>
          <div className="video-grid">
            {project.videos.map((url) => {
              const id = youtubeId(url);
              if (!id) return null;
              return (
                <div className="video-frame" key={url}>
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title={`${project.title} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <p style={{ marginTop: "2.5rem" }}>
        <Link href="/ia" className="btn btn-primary">
          Preguntar a AutobuzzIA sobre esta obra
        </Link>
      </p>
    </div>
  );
}
