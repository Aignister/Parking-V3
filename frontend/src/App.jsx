import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import ParkingMap from "./components/parking/ParkingMap";
import AccessLog from "./components/pages/AccessLog";
import Statistics from "./components/pages/Statistics";
import { useParkingState } from "./hooks/UseParkingState";
import { PARKING_1_CONFIG, PARKING_2_CONFIG, PARKING_3_CONFIG } from "./config/parkingConfig";

// Map each sidebar key to its parking config
const PARKING_CONFIGS = {
  mapa1: PARKING_1_CONFIG,
  mapa2: PARKING_2_CONFIG,
  mapa3: PARKING_3_CONFIG,
};

// Aggregate stats hook for header
function useAllParkingStats() {
  const s1 = useParkingState(PARKING_1_CONFIG).stats;
  const s2 = useParkingState(PARKING_2_CONFIG).stats;
  const s3 = useParkingState(PARKING_3_CONFIG).stats;
  return {
    totalSpots:    s1.totalSpots    + s2.totalSpots    + s3.totalSpots,
    occupiedCount: s1.occupiedCount + s2.occupiedCount + s3.occupiedCount,
    freeCount:     s1.freeCount     + s2.freeCount     + s3.freeCount,
    disabledCount: s1.disabledCount + s2.disabledCount + s3.disabledCount,
  };
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem,  setActiveItem]  = useState("mapa1");

  const stats = useAllParkingStats();

  // Esc closes sidebar
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleItemChange = (id) => {
    setActiveItem(id);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (PARKING_CONFIGS[activeItem]) {
      return <ParkingMap parkingConfig={PARKING_CONFIGS[activeItem]} />;
    }
    switch (activeItem) {
      case "registro":     return <AccessLog />;
      case "estadisticas": return <Statistics />;
      default:             return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        stats={stats}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeItem}
        onItemChange={handleItemChange}
      />

      <main className="pt-16">
        {renderContent()}
      </main>
    </div>
  );
}