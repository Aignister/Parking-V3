import ParkingZone from "./ParkingZone";

export default function ParkingMap({ parkingConfig, isOccupied, toggleSpot }) {
  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{parkingConfig.title}</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">{parkingConfig.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { label: "Disponible", border: "#d1d5db", bg: "#f9fafb", dot: "#d1d5db" },
          { label: "Ocupado", border: "rgba(220,38,38,0.5)", bg: "#fef2f2",  dot: "#dc2626" },
          { label: "Discapacitados", border: "rgba(37,99,235,0.4)", bg: "#eff6ff", dot: "#2563eb" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div
              className="rounded flex items-center justify-center"
              style={{ width: 20, height: 28, border: `1.5px solid ${l.border}`, background: l.bg }}
            >
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: l.dot }} />
            </div>
            <span className="text-[11px] text-gray-400 font-mono">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-gray-300 self-center hidden sm:block">
          Click en un espacio para cambiar estado
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {parkingConfig.zones.map((zone) => (
          <ParkingZone
            key={zone.id}
            zone={zone}
            isOccupied={isOccupied}
            onToggle={toggleSpot}
          />
        ))}
      </div>
    </div>
  );
}