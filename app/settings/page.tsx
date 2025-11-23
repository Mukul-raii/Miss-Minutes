import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Type assertion for custom user properties
  const user = session?.user as
    | { apiToken?: string; email?: string; name?: string }
    | undefined;
  const apiToken = user?.apiToken;
  const email = user?.email;
  const name = user?.name;

  return <SettingsContent apiToken={apiToken} email={email} name={name} />;
}
