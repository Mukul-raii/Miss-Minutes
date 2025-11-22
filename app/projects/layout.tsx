import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SidebarWrapper from "@/components/Sidebar";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <SidebarWrapper
      userName={session.user?.name || undefined}
      userEmail={session.user?.email || undefined}
    >
      {children}
    </SidebarWrapper>
  );
}
