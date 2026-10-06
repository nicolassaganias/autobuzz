import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Acerca",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Link href="/" className="back-link">
        ← Obras
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
          margin: "0 0 1.25rem",
        }}
      >
        {about.title}
      </h1>
      <div className="about-block">{about.text}</div>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/ia" className="btn btn-primary">
          Preguntarle a AutobuzzIA
        </Link>
      </p>
    </div>
  );
}
