import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";

export function WorkCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <Link
      href={`/obras/${project.slug}`}
      className="work-card"
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <Image
        src={project.cover || project.images[0]}
        alt={project.title}
        width={800}
        height={520}
        sizes="(max-width:720px) 100vw, 33vw"
      />
      <div className="work-meta">
        <h3>{project.title}</h3>
        <span>
          {[project.year, ...(project.tags ?? []).slice(0, 2)].filter(Boolean).join(" · ")}
        </span>
      </div>
    </Link>
  );
}
