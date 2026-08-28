import { redirect } from "next/navigation";
import { dashboardPath, getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  redirect(session ? dashboardPath(session.user.role) : "/login");
}
