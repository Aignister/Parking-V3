const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Logs
export const logAccess = (parkingId, spotCode, action) =>
  request("/api/logs", {
    method: "POST", 
    body: JSON.stringify({ parking_id: parkingId, spot_code: spotCode, action }),
  });

export const fetchLogs = (parkingId, limit = 100, offset = 0) => {
  const q = new URLSearchParams({ limit, offset });
  if (parkingId) q.set("parking_id", parkingId);
  return request(`/api/logs?${q}`);
};

// Stats
export const fetchDailyStats = (days   = 7) => request(`/api/stats/daily?days=${days}`);
export const fetchWeeklyStats = (weeks  = 4) => request(`/api/stats/weekly?weeks=${weeks}`);
export const fetchMonthlyStats = (months = 6) => request(`/api/stats/monthly?months=${months}`);
export const fetchStatsSummary = () => request("/api/stats/summary");