import { useState, useCallback, useMemo } from "react";
import { logAccess } from "../services/api";

// Initial occupied spots per parking (offline fallback / seed)
const INITIAL_OCCUPIED = {
  1: new Set(["A02","A04","A06","A08","A13","B03","B05","C02","C04","D01","D03","D05","D07"]),
  2: new Set(["E01","E05","F02","F06","G03","H04","H07"]),
  3: new Set(["I02","I04","J01","J05","K03","L02","L06"]),
};

export function useParkingState(parkingConfig) {
  const parkingId = parkingConfig?.id ?? 1;

  const [occupiedSpots, setOccupiedSpots] = useState(
    () => new Set(INITIAL_OCCUPIED[parkingId] ?? [])
  );

  const allSpots = useMemo(
    () => (parkingConfig?.zones ?? []).flatMap((z) => z.spots),
    [parkingConfig]
  );

  const totalSpots    = allSpots.length;
  const occupiedCount = occupiedSpots.size;
  const freeCount     = totalSpots - occupiedCount;
  const disabledCount = allSpots.filter((s) => s.type === "disabled").length;

  const isOccupied = useCallback(
    (spotId) => occupiedSpots.has(spotId),
    [occupiedSpots]
  );

  const toggleSpot = useCallback(
    (spotId) => {
      setOccupiedSpots((prev) => {
        const next   = new Set(prev);
        const action = next.has(spotId) ? "exit" : "entry";
        action === "exit" ? next.delete(spotId) : next.add(spotId);

        // Fire-and-forget to backend
        logAccess(parkingId, spotId, action).catch(console.warn);

        return next;
      });
    },
    [parkingId]
  );

  return {
    occupiedSpots,
    isOccupied,
    toggleSpot,
    stats: { totalSpots, occupiedCount, freeCount, disabledCount },
  };
}