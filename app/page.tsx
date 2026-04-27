import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  let s = null;
  try {
    s = await getServerSession(authOptions);
  } catch {
    redirect("/login");
  }
  if (s) redirect("/dashboard");
  redirect("/login");
}
