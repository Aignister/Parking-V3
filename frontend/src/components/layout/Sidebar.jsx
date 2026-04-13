import { Map, ClipboardList, BarChart3, X } from "lucide-react";

const navItems = [
  { id: "mapa1", icon: <Map size={18} />, label: "Parking 1", group: "Mapas" },
  { id: "mapa2", icon: <Map size={18} />, label: "Parking 2", group: "Mapas" },
  { id: "mapa3", icon: <Map size={18} />, label: "Parking 3", group: "Mapas" },
  { id: "registro", icon: <ClipboardList size={18} />, label: "Registro de Accesos", group: "Gestión" },
  { id: "estadisticas", icon: <BarChart3 size={18} />, label: "Estadísticas", group: "Gestión" },
];

export default function Sidebar({ isOpen, onClose, activeItem, onItemChange }) {
  const groups = [...new Set(navItems.map((i) => i.group))];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 bg-[#0f0f0f] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="text-white font-semibold text-[15px] tracking-tight">Parking</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav grouped */}
        <nav className="flex-1 px-3 pt-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/30 font-medium">
                {group}
              </p>
              <div className="space-y-0.5">
                {navItems
                  .filter((item) => item.group === group)
                  .map(({ id, icon, label }) => {
                    const isActive = activeItem === id;
                    return (
                      <button
                        key={id}
                        onClick={() => onItemChange(id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-150 group ${
                          isActive
                            ? "bg-white text-[#0f0f0f]"
                            : "text-white/50 hover:text-white hover:bg-white/[0.07]"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-[#0f0f0f]"
                              : "text-white/40 group-hover:text-white/70"
                          }`}
                        >
                          {icon}
                        </span>
                        <span className="flex-1 text-left">{label}</span>
                        {isActive && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#111111", opacity: 0.4 }}
                          />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            Campus Universitario · v2.0
          </p>
        </div>
      </aside>
    </>
  );
}