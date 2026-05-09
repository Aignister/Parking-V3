import { useState, useEffect } from "react";
import { fetchDailyStats, fetchWeeklyStats, fetchMonthlyStats, fetchStatsSummary } from "../../services/api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import { TrendingUp, Car, ArrowUpRight, ArrowDownRight } from "lucide-react";

const P_COLORS = { 1: "#111111", 2: "#2563eb", 3: "#dc2626" };
const P_LIGHT = { 1: "#f3f4f6", 2: "#dbeafe", 3: "#fee2e2" };

function mockSummary() {
  return [1,2,3].map((id) => ({
    parking_id: id, parking_name: `Parking ${id}`,
    total_spots: 56,
    total_entries: Math.floor(Math.random()*800)+200,
    total_exits: Math.floor(Math.random()*800)+200,
    entries_today: Math.floor(Math.random()*40)+5,
    currently_occupied: Math.floor(Math.random()*35),
  }));
}

function mockDaily(days=7) {
  const rows = [];
  for (let d = days-1; d >= 0; d--) {
    const date = new Date(Date.now() - d*86400000);
    const day  = date.toISOString().slice(0,10);
    [1,2,3].forEach((pid) => rows.push({
      parking_id:   pid, parking_name:`Parking ${pid}`,
      day,
      entries: Math.floor(Math.random()*60)+10,
      exits: Math.floor(Math.random()*60)+10,
    }));
  }
  return rows;
}

function mockWeekly(weeks=4) {
  const rows = [];
  for (let w = weeks-1; w >= 0; w--) {
    const d = new Date(Date.now() - w*7*86400000);
    const week_start = d.toISOString().slice(0,10);
    [1,2,3].forEach((pid) => rows.push({
      parking_id: pid, parking_name:`Parking ${pid}`,
      week_start,
      entries: Math.floor(Math.random()*300)+60,
      exits: Math.floor(Math.random()*300)+60,
    }));
  }
  return rows;
}

function mockMonthly(months=6) {
  const rows = [];
  for (let m = months-1; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m, 1);
    const month_start = d.toISOString().slice(0,10);
    [1,2,3].forEach((pid) => rows.push({
      parking_id: pid, parking_name:`Parking ${pid}`,
      month_start,
      entries: Math.floor(Math.random()*1200)+300,
      exits: Math.floor(Math.random()*1200)+300,
    }));
  }
  return rows;
}

function pivotRows(rows, dateKey) {
  const map = {};
  rows.forEach(({ [dateKey]: date, parking_id, entries, exits }) => {
    if (!map[date]) map[date] = { date };
    map[date][`p${parking_id}_entries`] = Number(entries);
    map[date][`p${parking_id}_exits`] = Number(exits);
  });
  return Object.values(map).sort((a,b) => a.date.localeCompare(b.date));
}

function fmtDate(str) {
  const d = new Date(str + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day:"2-digit", month:"short" });
}
function fmtWeek(str) {
  const d = new Date(str + "T12:00:00");
  return `Sem ${d.toLocaleDateString("es-MX", { day:"2-digit", month:"short" })}`;
}
function fmtMonth(str) {
  const d = new Date(str + "T12:00:00");
  return d.toLocaleDateString("es-MX", { month:"short", year:"2-digit" });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-mono font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ title, value, sub, color, light, icon }) {
  const Icon = icon;
  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-5 flex items-start justify-between"
      style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
        <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
      </div>
      <div style={{ background: light, borderRadius: 12, padding: 10 }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div
      className="rounded-xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div style={{ height:3, background:"#111111" }} />
      <div className="p-5">
        <p className="font-semibold text-gray-900 text-sm tracking-tight">{title}</p>
        <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-4">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [summary, setSummary] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [tab, setTab] = useState("daily");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, d, w, m] = await Promise.all([
          fetchStatsSummary(), fetchDailyStats(7), fetchWeeklyStats(4), fetchMonthlyStats(6),
        ]);
        setSummary(s); setDaily(d); setWeekly(w); setMonthly(m);
        setUseMock(false);
      } catch {
        setSummary(mockSummary()); setDaily(mockDaily(7));
        setWeekly(mockWeekly(4)); setMonthly(mockMonthly(6));
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tabConfig = {
    daily: { rows: daily, key: "day", fmt: fmtDate,  label: "Últimos 7 días" },
    weekly: { rows: weekly, key: "week_start",  fmt: fmtWeek,  label: "Últimas 4 semanas" },
    monthly: { rows: monthly, key: "month_start", fmt: fmtMonth, label: "Últimos 6 meses" },
  };
  const { rows, key, fmt, label } = tabConfig[tab];
  const chartData = pivotRows(rows, key).map((r) => ({ ...r, date: fmt(r.date) }));

  const totalEntries = summary.reduce((s,p) => s + Number(p.total_entries||0), 0);
  const todayEntries = summary.reduce((s,p) => s + Number(p.entries_today||0), 0);
  const totalOccupied = summary.reduce((s,p) => s + Number(p.currently_occupied||0), 0);
  const totalSpots = summary.reduce((s,p) => s + Number(p.total_spots||0), 0);

  const busiest = summary.reduce((best, p) =>
    Number(p.total_entries||0) > Number(best?.total_entries||0) ? p : best, null);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Estadísticas</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
          Comparativa de flujo entre parkings
        </p>
      </div>

      {useMock && (
        <div className="px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
          Backend no disponible — mostrando datos de demostración
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total entradas" value={totalEntries.toLocaleString()}
          sub="todos los parkings" color="#111111" light="#f3f4f6" icon={Car}
        />
        <StatCard
          title="Entradas hoy" value={todayEntries}
          sub="últimas 24 h" color="#16a34a" light="#f0fdf4" icon={ArrowUpRight}
        />
        <StatCard
          title="Ocupados ahora" value={`${totalOccupied}/${totalSpots}`}
          sub="espacios en uso" color="#dc2626" light="#fef2f2" icon={TrendingUp}
        />
        <StatCard
          title="Mayor flujo" value={busiest?.parking_name ?? "—"}
          sub={busiest ? `${Number(busiest.total_entries).toLocaleString()} entradas` : ""}
          color="#2563eb" light="#eff6ff" icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.map((p) => {
          const occ = Number(p.currently_occupied||0);
          const tot = Number(p.total_spots||0);
          const pct = tot ? Math.round(occ/tot*100) : 0;
          const barColor = pct > 75 ? "#dc2626" : pct > 45 ? "#f59e0b" : "#16a34a";
          return (
            <div
              key={p.parking_id}
              className="rounded-xl border border-gray-100 bg-white p-5"
              style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.05)", borderTop:`3px solid ${P_COLORS[p.parking_id]}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900 text-sm">{p.parking_name}</p>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{ background: P_LIGHT[p.parking_id], color: P_COLORS[p.parking_id] }}
                >
                  {pct}% ocupado
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { label:"Entradas totales", val: Number(p.total_entries||0).toLocaleString() },
                  { label:"Salidas totales", val: Number(p.total_exits||0).toLocaleString() },
                  { label:"Entradas hoy",val: p.entries_today },
                  { label:"Espacios libres", val: tot - occ },
                ].map(({ label: l, val }) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">{l}</p>
                    <p className="font-mono font-bold text-gray-800 text-base">{val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-full overflow-hidden" style={{ height:3, background:"#f3f4f6" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:barColor, transition:"width 0.4s ease", borderRadius:9999 }} />
              </div>
            </div>
          );
        })}
      </div>

      <Section title="Comparativa de flujo" subtitle={label}>
        <div className="flex gap-2 mb-5">
          {[["daily","Diario"],["weekly","Semanal"],["monthly","Mensual"]].map(([v,lbl]) => (
            <button
              key={v} onClick={() => setTab(v)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={tab===v ? {background:"#111111",color:"#fff"} : {background:"#f3f4f6",color:"#6b7280"}}
            >
              {lbl}
            </button>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-3">Entradas por parking</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:10 }} />
            {[1,2,3].map((pid) => (
              <Bar key={pid} dataKey={`p${pid}_entries`} name={`Parking ${pid}`}
                fill={P_COLORS[pid]} radius={[3,3,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-3 mt-6">Tendencia de salidas</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:10 }} />
            {[1,2,3].map((pid) => (
              <Line key={pid} type="monotone" dataKey={`p${pid}_exits`}
                name={`Parking ${pid} salidas`}
                stroke={P_COLORS[pid]} strokeWidth={2} dot={{ r:3, fill:P_COLORS[pid] }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Section>

    </div>
  );
}