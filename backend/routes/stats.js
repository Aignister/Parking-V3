const router = require("express").Router();
const pool   = require("../db/pool");

router.get("/daily", async (req, res) => {
  const days = parseInt(req.query.days || "7");
  try {
    const { rows } = await pool.query(`
      SELECT p.id AS parking_id, p.name AS parking_name, gs.day::date AS day, COALESCE(ds.entries, 0) AS entries, COALESCE(ds.exits, 0) AS exits
      FROM parkings p CROSS JOIN ( SELECT generate_series( NOW()::date - ($1 - 1) * INTERVAL '1 day', NOW()::date, '1 day' )::date AS day ) gs
      LEFT JOIN daily_stats ds ON ds.parking_id = p.id AND ds.day = gs.day ORDER BY gs.day, p.id
    `, [days]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/weekly", async (req, res) => {
  const weeks = parseInt(req.query.weeks || "4");
  try {
    const { rows } = await pool.query(`
      SELECT p.id AS parking_id, p.name AS parking_name, gs.week_start::date AS week_start, COALESCE(ws.entries, 0) AS entries, COALESCE(ws.exits, 0) AS exits
      FROM parkings p CROSS JOIN ( SELECT generate_series( DATE_TRUNC('week', NOW()) - ($1 - 1) * INTERVAL '1 week', DATE_TRUNC('week', NOW()),'1 week' )::date AS week_start ) gs
      LEFT JOIN weekly_stats ws ON ws.parking_id = p.id AND ws.week_start = gs.week_start ORDER BY gs.week_start, p.id
    `, [weeks]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/monthly", async (req, res) => {
  const months = parseInt(req.query.months || "6");
  try {
    const { rows } = await pool.query(`
      SELECT p.id AS parking_id, p.name AS parking_name, gs.month_start::date AS month_start, COALESCE(ms.entries, 0) AS entries, COALESCE(ms.exits,   0) AS exits 
      FROM parkings p CROSS JOIN ( SELECT generate_series( DATE_TRUNC('month', NOW()) - ($1 - 1) * INTERVAL '1 month', DATE_TRUNC('month', NOW()), '1 month' )::date AS month_start ) gs
      LEFT JOIN monthly_stats ms ON ms.parking_id = p.id AND ms.month_start = gs.month_start ORDER BY gs.month_start, p.id
    `, [months]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id AS parking_id, p.name AS parking_name, p.total_spots, COUNT(al.id) FILTER (WHERE al.action = 'entry') AS total_entries,
      COUNT(al.id) FILTER (WHERE al.action = 'exit')  AS total_exits, COUNT(al.id) FILTER (WHERE al.action = 'entry' AND al.occurred_at >= NOW() - INTERVAL '24 hours') AS entries_today,
      COALESCE(( SELECT COUNT(*) FROM spot_states ss WHERE ss.parking_id = p.id AND ss.is_occupied = TRUE ), 0) AS currently_occupied FROM parkings p  LEFT JOIN access_logs al ON al.parking_id = p.id  
      GROUP BY p.id ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;