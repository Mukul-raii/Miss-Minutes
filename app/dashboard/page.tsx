import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Session check is in layout, but we need apiToken
  // @ts-expect-error - session user apiToken
  const apiToken = session?.user?.apiToken;

  return <DashboardContent apiToken={apiToken} />;
}
