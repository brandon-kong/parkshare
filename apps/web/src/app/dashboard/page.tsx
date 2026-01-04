import SignOutButton from "@/components/auth/sign-out-button";
import { spotsApi } from "@/lib/features/spot";
import { auth, signOut } from "@/lib/features/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const listSpots = await spotsApi.list();

  return (
    <div>
      Welcome, {session.user.id}. You have {listSpots.length} spots.
      <SignOutButton />
    </div>
  );
}
