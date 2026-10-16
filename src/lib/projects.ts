import data from "@/data/autobuzz.json";

export type Project = {
  id: string;
  slug: string;
  title: string;
  link: string;
  description: string;
  images: string[];
  videos: string[];
  cover: string;
  year?: string;
  tags?: string[];
};

export type About = {
  title: string;
  text: string;
};

export const about = data.about as About;
export const projects = data.projects as Project[];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function youtubeId(url: string) {
  const embed = url.match(/embed\/([^?&/]+)/);
  if (embed) return embed[1];
  const short = url.match(/youtu\.be\/([^?&/]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return watch[1];
  return null;
}

export function knowledgeBase() {
  const projectBlocks = projects
    .map((project) => {
      return [
        `## ${project.title} (${project.year ?? "s/f"})`,
        `Slug: ${project.slug}`,
        `Tags: ${(project.tags ?? []).join(", ") || "—"}`,
        project.description,
        project.videos.length
          ? `Videos: ${project.videos.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    "# Autobuzz — base de conocimiento",
    "",
    "## Sobre el colectivo",
    about.text,
    "",
    "## Obras",
    projectBlocks,
  ].join("\n");
}
