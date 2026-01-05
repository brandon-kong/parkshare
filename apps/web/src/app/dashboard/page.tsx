import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { SpotCard } from "@/components/dashboard/spot-card";
import { auth } from "@/lib/features/auth";
import { spotsApi } from "@/lib/features/spot";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const spots = await spotsApi.list();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/host"
            className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            List a Spot
          </Link>
          <SignOutButton />
        </div>
      </div>

      <p className="text-muted-foreground">Welcome, {session.user.name}</p>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Spots ({spots.length})</h2>

        {spots.length === 0 ? (
          <p className="text-muted-foreground">
            You haven&apos;t listed any spots yet.
          </p>
        ) : (
          <div className="space-y-4">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
