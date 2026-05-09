export default function ParkingSpot({ spot, isOccupied, onClick }) {
  const isDisabled = spot.type === "disabled";

  return (
    <button
      onClick={() => onClick(spot.id)}
      title={`${spot.id} · ${isOccupied ? "Ocupado" : "Disponible"}${isDisabled ? " · Discapacitados" : ""}`}
      className="relative group"
      style={{ width: 54, height: 72, background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <div
        className="absolute inset-0 rounded-md transition-all duration-200"
        style={{
          border: isOccupied
            ? "1.5px solid rgba(220,38,38,0.45)"
            : isDisabled
            ? "1.5px solid rgba(37,99,235,0.35)"
            : "1.5px solid #e5e7eb",
          background: isOccupied
            ? "rgba(254,242,242,0.6)"
            : isDisabled
            ? "rgba(239,246,255,0.6)"
            : "rgba(249,250,251,0.8)",
        }}
      />

      <div
        className="absolute rounded transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
        style={{
          inset: 5,
          border: isOccupied
            ? "1.5px solid rgba(220,38,38,0.6)"
            : isDisabled
            ? "1.5px solid rgba(37,99,235,0.45)"
            : "1.5px solid #d1d5db",
          background: isOccupied
            ? "linear-gradient(160deg, #fef2f2 0%, #fee2e2 100%)"
            : isDisabled
            ? "linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)"
            : "linear-gradient(160deg, #ffffff 0%, #f9fafb 100%)",
          boxShadow: isOccupied
            ? "inset 0 1px 4px rgba(220,38,38,0.15)"
            : isDisabled
            ? "inset 0 1px 4px rgba(37,99,235,0.12)"
            : "inset 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {isDisabled && !isOccupied && (
          <span style={{ fontSize: 13, lineHeight: 1, color: "#2563eb", opacity: 0.7 }}></span>
        )}
        <span
          className="font-mono font-bold tracking-tight"
          style={{
            fontSize: 9,
            color: isOccupied ? "#dc2626" : isDisabled ? "#2563eb" : "#9ca3af",
          }}
        >
          {spot.id}
        </span>
      </div>

      {isOccupied && (
        <div
          className="absolute"
          style={{
            top: -5, right: -5,
            width: 12, height: 12,
            borderRadius: "50%",
            background: "#dc2626",
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 1px rgba(220,38,38,0.3)",
          }}
        />
      )}

      <div
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ background: "rgba(0,0,0,0.04)", pointerEvents: "none" }}
      />
    </button>
  );
}