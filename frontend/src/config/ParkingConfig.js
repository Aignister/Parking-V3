export const SPOT_TYPES = {
  standard: { label: "Estándar", color: "#111111" },
  disabled: { label: "Discapacitados", color: "#2563eb" },
  vip: { label: "Preferencial", color: "#111111" },
};

// Helper to generate zones for a parking
function makeZones(zoneLetters, descriptions, disabledRows = [0]) {
  return zoneLetters.map((letter, idx) => ({
    id: letter,
    label: `Zona ${letter}`,
    description: descriptions[idx] ?? "",
    accent: "#111111",
    spots: Array.from({ length: 14 }, (_, i) => ({
      id: `${letter}${String(i + 1).padStart(2, "0")}`,
      type: disabledRows.includes(idx) && i < 3 ? "disabled" : "standard",
    })),
  }));
}

// Parking 1
export const PARKING_1_CONFIG = {
  id: 1,
  title:    "Parking 1",
  subtitle: "Estacionamiento Principal · Planta Baja",
  zones: makeZones(
    ["A", "B", "C", "D"],
    ["Acceso Principal", "Pasillo Sur", "Ala Izquierda", "Ala Derecha"],
    [0]
  ),
};

// Parking 2
export const PARKING_2_CONFIG = {
  id: 2,
  title:    "Parking 2",
  subtitle: "Estacionamiento Norte · Nivel 1",
  zones: makeZones(
    ["E", "F", "G", "H"],
    ["Entrada Norte", "Pasillo Central", "Ala Este", "Ala Oeste"],
    [1]
  ),
};

// Parking 3
export const PARKING_3_CONFIG = {
  id: 3,
  title:    "Parking 3",
  subtitle: "Estacionamiento Sur · Nivel 2",
  zones: makeZones(
    ["I", "J", "K", "L"],
    ["Entrada Sur", "Pasillo Norte", "Ala Este", "Ala Oeste"],
    [2]
  ),
};

export const ALL_PARKINGS = [PARKING_1_CONFIG, PARKING_2_CONFIG, PARKING_3_CONFIG];

// Legacy export for backward compat
export const PARKING_CONFIG = PARKING_1_CONFIG;