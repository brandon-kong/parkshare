import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
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
          <Button asChild>
            <Link href="/host">List a Spot</Link>
          </Button>
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
              <div
                key={spot.id}
                className="border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{spot.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {spot.address}, {spot.city}, {spot.state}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      spot.status === "active"
                        ? "bg-green-100 text-green-800"
                        : spot.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {spot.status}
                  </span>
                </div>

                {spot.description && (
                  <p className="text-sm">{spot.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    {spot.spot_type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle Size:</span>{" "}
                    {spot.vehicle_size}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>{" "}
                    {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>{" "}
                    {spot.country}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {spot.is_covered && (
                    <span className="px-2 py-1 bg-accent rounded-md text-xs">
                      Covered
                    </span>
                  )}
                  {spot.has_ev_charging && (
                    <span className="px-2 py-1 bg-accent rounded-md text-xs">
                      EV Charging
                    </span>
                  )}
                  {spot.has_security && (
                    <span className="px-2 py-1 bg-accent rounded-md text-xs">
                      Security
                    </span>
                  )}
                </div>

                {spot.access_instructions && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Access Instructions:
                    </span>{" "}
                    {spot.access_instructions}
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  {spot.hourly_rate !== undefined &&
                    spot.hourly_rate !== null && (
                      <div>
                        <span className="text-muted-foreground">Hourly:</span> $
                        {spot.hourly_rate}
                      </div>
                    )}
                  {spot.daily_rate !== undefined &&
                    spot.daily_rate !== null && (
                      <div>
                        <span className="text-muted-foreground">Daily:</span> $
                        {spot.daily_rate}
                      </div>
                    )}
                  {spot.monthly_rate !== undefined &&
                    spot.monthly_rate !== null && (
                      <div>
                        <span className="text-muted-foreground">Monthly:</span>{" "}
                        ${spot.monthly_rate}
                      </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <div>ID: {spot.id}</div>
                  <div>
                    Created: {new Date(spot.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
