import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { dashboardPath, getSession } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(dashboardPath(session.user.role));

  return (
    <>
      <Nav user={session.user} />
      <main>{children}</main>
    </>
  );
}
