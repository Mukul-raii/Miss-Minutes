import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // @ts-expect-error - session user apiToken
  const apiToken = session.user.apiToken;

  return <DashboardContent apiToken={apiToken} />;
}
