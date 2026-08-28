import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { Role, User } from "@/lib/types";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  PARENT: [
    { href: "/parent", label: "Children" },
    { href: "/parent/enrollments", label: "Enrollments" },
    { href: "/parent/sessions", label: "Sessions" },
  ],
  TUTOR: [
    { href: "/tutor", label: "Students" },
    { href: "/tutor/sessions", label: "Sessions" },
    { href: "/tutor/reports", label: "Progress reports" },
  ],
  ADMIN: [{ href: "/admin", label: "Overview" }],
};

export function Nav({ user }: { user: User }) {
  return (
    <nav className="nav">
      <strong>Teach Me Hub</strong>
      {LINKS[user.role].map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <span className="spacer" />
      <span className="muted">
        {user.fullName} ({user.role})
      </span>
      <form action={logout} className="inline-form">
        <button type="submit">Log out</button>
      </form>
    </nav>
  );
}
