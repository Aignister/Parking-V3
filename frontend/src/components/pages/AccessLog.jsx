import { useState, useEffect, useCallback } from "react";
import { fetchLogs } from "../../services/api";
import { RefreshCw, Filter } from "lucide-react";

const PARKING_LABELS = { 0: "Todos", 1: "Parking 1", 2: "Parking 2", 3: "Parking 3" };
const ACTION_COLORS  = { entry: { bg: "#f0fdf4", text: "#16a34a", border: "rgba(22,163,74,0.3)",  label: "Entrada" }, exit:  { bg: "#fef2f2", text: "#dc2626", border: "rgba(220,38,38,0.3)", label: "Salida"  } };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour12: false });
}

function generateMockLogs(count = 60) {
  const parkings = [1, 2, 3];
  const zones = { 1: ["A","B","C","D"], 2: ["E","F","G","H"], 3: ["I","J","K","L"] };
  const actions = ["entry", "exit"];
  const logs = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const pid = parkings[Math.floor(Math.random() * 3)];
    const zone = zones[pid][Math.floor(Math.random() * 4)];
    const spotNo = String(Math.floor(Math.random() * 14) + 1).padStart(2, "0");
    logs.push({
      id: count - i,
      parking_id: pid,
      parking_name: `Parking ${pid}`,
      spot_code: `${zone}${spotNo}`,
      action: actions[Math.floor(Math.random() * 2)],
      occurred_at: new Date(now - i * 4 * 60 * 1000).toISOString(),
    });
  }
  return logs;
}

export default function AccessLog() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLogs(filter || undefined, 100);
      setLogs(data);
      setUseMock(false);
    } catch {
      setLogs(generateMockLogs(60));
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const displayed = filter
    ? logs.filter((l) => l.parking_id === filter)
    : logs;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Accesos</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
            Historial de entradas y salidas por parking
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {useMock && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
          Backend no disponible — mostrando datos de demostración
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <Filter size={13} className="text-gray-400" />
        <span className="text-xs text-gray-400 mr-2">Filtrar:</span>
        {Object.entries(PARKING_LABELS).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(Number(id))}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
            style={
              filter === Number(id)
                ? { background: "#111111", color: "#ffffff" }
                : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl border border-gray-100 bg-white overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div style={{ height: 3, background: "#111111" }} />

        <div
          className="grid text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-5 py-3 border-b border-gray-50"
          style={{ gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1fr" }}
        >
          <span>Parking</span>
          <span>Espacio</span>
          <span>Acción</span>
          <span>Fecha</span>
          <span>Hora</span>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))
          ) : displayed.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No hay registros disponibles
            </div>
          ) : (
            displayed.map((log) => {
              const ac = ACTION_COLORS[log.action] ?? ACTION_COLORS.entry;
              return (
                <div
                  key={log.id}
                  className="grid items-center px-5 py-3 hover:bg-gray-50/60 transition-colors text-sm"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1fr" }}
                >
                  <span className="font-medium text-gray-800 text-xs">{log.parking_name}</span>
                  <span className="font-mono text-xs font-bold text-gray-600">{log.spot_code}</span>
                  <span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: ac.bg, color: ac.text, border: `1px solid ${ac.border}` }}
                    >
                      {ac.label}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(log.occurred_at)}</span>
                  <span className="font-mono text-xs text-gray-500">{formatTime(log.occurred_at)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-gray-300 text-right">
        {displayed.length} registros · actualizado {new Date().toLocaleTimeString("es-MX", { hour12: false })}
      </p>
    </div>
  );
}