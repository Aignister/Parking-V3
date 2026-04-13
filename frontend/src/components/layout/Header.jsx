import { Menu } from "lucide-react";
import { useClock } from "../../hooks/UseClock";

export default function Header({ onMenuClick, stats }) {
  const time = useClock();
  const { totalSpots = 0, occupiedCount = 0, freeCount = 0 } = stats ?? {};

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 bg-white border-b border-gray-100">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 max-w-screen-2xl mx-auto">

        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Abrir menú"
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <Menu size={20} strokeWidth={2} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight hidden sm:block">
              Parking
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4">

          <div className="hidden md:flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ background: "#d1d5db" }} />
            <span className="tabular-nums">{totalSpots}</span>
            <span className="text-gray-400">TOTAL</span>
          </div>

          <div className="hidden md:block w-px h-4 bg-gray-200" />

          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ background: "#16a34a" }} />
            <span className="tabular-nums">{freeCount}</span>
            <span className="text-gray-400 hidden sm:inline">LIBRES</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
            style={{ background: "#111111", color: "#ffffff" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "#dc2626" }} />
            <span className="tabular-nums">{occupiedCount}</span>
            <span className="hidden sm:inline text-gray-400 font-medium">OCUPADOS</span>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          <div className="text-[12px] sm:text-[13px] text-gray-400 font-mono tabular-nums">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
}