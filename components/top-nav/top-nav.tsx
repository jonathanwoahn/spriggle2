import { isAdmin, isUser, getSession } from "@/lib/auth";
import TopNavBar from "./top-nav-bar";

export default async function TopNav() {
  const admin = await isAdmin();
  const user = await isUser();
  const session = await getSession();
  const userEmail = session?.user?.email || undefined;

  return (
    <TopNavBar
      isAdmin={admin}
      isUser={user}
      userEmail={userEmail}
    />
  );
}
