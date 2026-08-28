import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { dashboardPath, getSession } from "@/lib/session";

export default async function TutorLayout({ children }: LayoutProps<"/tutor">) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "TUTOR") redirect(dashboardPath(session.user.role));

  return (
    <>
      <Nav user={session.user} />
      <main>{children}</main>
    </>
  );
}
