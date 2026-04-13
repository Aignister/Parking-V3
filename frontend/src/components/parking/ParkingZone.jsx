import ParkingSpot from "./ParkingSpot";

export default function ParkingZone({ zone, isOccupied, onToggle }) {
  const occupied = zone.spots.filter((s) => isOccupied(s.id)).length;
  const total = zone.spots.length;
  const pct = Math.round((occupied / total) * 100);
  const barColor = pct > 75 ? "#dc2626" : pct > 45 ? "#f59e0b" : "#16a34a";

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div style={{ height: 3, background: "#111111", borderRadius: "12px 12px 0 0" }} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg font-mono font-bold"
              style={{
                width: 32, height: 32,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                fontSize: 13, color: "#111111",
              }}
            >
              {zone.id}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm tracking-tight">{zone.label}</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest">{zone.description}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-xs text-gray-500">
              <span className="text-red-600 font-bold">{occupied}</span>
              <span className="text-gray-300 mx-0.5">/</span>
              <span>{total}</span>
            </p>
            <div
              className="mt-1.5 rounded-full overflow-hidden"
              style={{ width: 60, height: 3, background: "#f3f4f6" }}
            >
              <div
                style={{
                  width: `${pct}%`, height: "100%",
                  background: barColor,
                  borderRadius: 9999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {zone.spots.map((spot) => (
            <ParkingSpot
              key={spot.id}
              spot={spot}
              isOccupied={isOccupied(spot.id)}
              onClick={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}