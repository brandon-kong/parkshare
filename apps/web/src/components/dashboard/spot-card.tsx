"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { spotsClientApi } from "@/lib/features/spot";
import type { Spot } from "@/lib/features/spot/types";

interface SpotCardProps {
  spot: Spot;
}

export function SpotCard({ spot }: SpotCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(spot.status);

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const updated = await spotsClientApi.publish(spot.id);
      setCurrentStatus(updated.status);
      router.refresh();
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      const updated = await spotsClientApi.unpublish(spot.id);
      setCurrentStatus(updated.status);
      router.refresh();
    } catch (error) {
      console.error("Failed to unpublish:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{spot.title}</h3>
          <p className="text-sm text-muted-foreground">
            {spot.address}, {spot.city}, {spot.state}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentStatus === "active"
              ? "bg-green-100 text-green-800"
              : currentStatus === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : currentStatus === "paused"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {currentStatus}
        </span>
      </div>

      {spot.description && <p className="text-sm">{spot.description}</p>}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span> {spot.spot_type}
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
          <span className="text-muted-foreground">Country:</span> {spot.country}
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
          <span className="text-muted-foreground">Access Instructions:</span>{" "}
          {spot.access_instructions}
        </div>
      )}

      <div className="flex gap-4 text-sm">
        {spot.hourly_rate !== undefined && spot.hourly_rate !== null && (
          <div>
            <span className="text-muted-foreground">Hourly:</span> $
            {spot.hourly_rate}
          </div>
        )}
        {spot.daily_rate !== undefined && spot.daily_rate !== null && (
          <div>
            <span className="text-muted-foreground">Daily:</span> $
            {spot.daily_rate}
          </div>
        )}
        {spot.monthly_rate !== undefined && spot.monthly_rate !== null && (
          <div>
            <span className="text-muted-foreground">Monthly:</span> $
            {spot.monthly_rate}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div>ID: {spot.id}</div>
          <div>Created: {new Date(spot.created_at).toLocaleString()}</div>
        </div>

        <div className="flex gap-2">
          {currentStatus === "draft" || currentStatus === "paused" ? (
            <Button
              size="sm"
              onClick={handlePublish}
              loading={isLoading}
              disabled={isLoading}
            >
              Publish
            </Button>
          ) : currentStatus === "active" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUnpublish}
              loading={isLoading}
              disabled={isLoading}
            >
              Unpublish
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
