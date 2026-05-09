const router = require("express").Router();
const pool   = require("../db/pool");

router.get("/", async (req, res) => {
  const { parking_id, limit = 50, offset = 0 } = req.query;
  try {
    let query = `
      SELECT al.id, al.parking_id, p.name AS parking_name, al.spot_code, al.action, al.occurred_at
      FROM access_logs al JOIN parkings p ON p.id = al.parking_id
    `;
    const params = [];
    if (parking_id) {
      params.push(parseInt(parking_id));
      query += ` WHERE al.parking_id = $${params.length}`;
    }
    query += ` ORDER BY al.occurred_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req, res) => {
  const { parking_id, spot_code, action } = req.body;
  if (!parking_id || !spot_code || !["entry", "exit"].includes(action)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: [log] } = await client.query(`
      INSERT INTO access_logs (parking_id, spot_code, action) VALUES ($1, $2, $3) RETURNING *
    `, [parking_id, spot_code, action]);

    await client.query(`
      INSERT INTO spot_states (parking_id, spot_code, is_occupied, updated_at) VALUES ($1, $2, $3, NOW())
      ON CONFLICT (parking_id, spot_code) DO UPDATE SET is_occupied = EXCLUDED.is_occupied, updated_at  = NOW()
    `, [parking_id, spot_code, action === "entry"]);

    await client.query("COMMIT");
    res.status(201).json(log);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
  }
});

module.exports = router;