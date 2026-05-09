const router = require("express").Router();
const pool   = require("../db/pool");

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.description, p.total_spots, COUNT(ss.spot_code) FILTER (WHERE ss.is_occupied = TRUE) AS occupied_count
      FROM parkings p LEFT JOIN spot_states ss ON ss.parking_id = p.id GROUP BY p.id ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:id/spots", async (req, res) => {
  const parkingId = parseInt(req.params.id);
  try {
    const { rows } = await pool.query(`
      SELECT s.spot_code, s.spot_type, COALESCE(ss.is_occupied, FALSE) AS is_occupied
      FROM spots s LEFT JOIN spot_states ss ON ss.parking_id = s.parking_id AND ss.spot_code = s.spot_code
      WHERE s.parking_id = $1 ORDER BY s.spot_code
    `, [parkingId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;