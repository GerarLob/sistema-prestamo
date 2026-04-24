import { AppNav } from "@/components/layout/AppNav";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    redirect("/login");
  }
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:max-w-6xl lg:px-8 xl:max-w-7xl">
        {children}
      </main>
    </div>
  );
}
