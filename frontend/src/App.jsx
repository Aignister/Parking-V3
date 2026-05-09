import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import ParkingMap from "./components/parking/ParkingMap";
import AccessLog from "./components/pages/AccessLog";
import Statistics from "./components/pages/Statistics";
import { useParkingState } from "./hooks/UseParkingState";
import { PARKING_1_CONFIG, PARKING_2_CONFIG, PARKING_3_CONFIG } from "./config/parkingConfig";

const PARKING_CONFIGS = {
  mapa1: PARKING_1_CONFIG,
  mapa2: PARKING_2_CONFIG,
  mapa3: PARKING_3_CONFIG,
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem,  setActiveItem]  = useState("mapa1");

  const p1 = useParkingState(PARKING_1_CONFIG);
  const p2 = useParkingState(PARKING_2_CONFIG);
  const p3 = useParkingState(PARKING_3_CONFIG);

  const PARKING_STATES = { mapa1: p1, mapa2: p2, mapa3: p3 };

  const stats = {
    totalSpots: p1.stats.totalSpots + p2.stats.totalSpots + p3.stats.totalSpots,
    occupiedCount: p1.stats.occupiedCount + p2.stats.occupiedCount + p3.stats.occupiedCount,
    freeCount: p1.stats.freeCount + p2.stats.freeCount + p3.stats.freeCount,
    disabledCount: p1.stats.disabledCount + p2.stats.disabledCount + p3.stats.disabledCount,
  };

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
      const { isOccupied, toggleSpot } = PARKING_STATES[activeItem];
      return (
        <ParkingMap
          parkingConfig={PARKING_CONFIGS[activeItem]}
          isOccupied={isOccupied}
          toggleSpot={toggleSpot}
        />
      );
    }
    switch (activeItem) {
      case "registro": return <AccessLog />;
      case "estadisticas": return <Statistics />;
      default: return null;
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