import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { dashboardPath, getSession } from "@/lib/session";

export default async function ParentLayout({ children }: LayoutProps<"/parent">) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "PARENT") redirect(dashboardPath(session.user.role));

  return (
    <>
      <Nav user={session.user} />
      <main>{children}</main>
    </>
  );
}
