import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { auth } from "@/lib/features/auth";
import { spotsApi } from "@/lib/features/spot";

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
