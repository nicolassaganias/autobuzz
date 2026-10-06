"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Obras" },
  { href: "/acerca", label: "Acerca" },
  { href: "/ia", label: "AutobuzzIA", special: true },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="ΛUTOBUZZ inicio">
        ΛUTO<span>BUZZ</span>
      </Link>
      <nav className="nav" aria-label="Principal">
        {links.map((link) => {
          const current =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={link.special ? "nav-ia" : undefined}
              aria-current={current ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
