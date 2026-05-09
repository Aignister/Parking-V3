require("dotenv").config();
const express = require("express");
const cors = require("cors");

const parkingsRouter = require("./routes/parking");
const logsRouter = require("./routes/logs");
const statsRouter = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

app.use("/api/parkings", parkingsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/stats", statsRouter);

app.get("/health", (_, res) => res.json({ status: "ok", ts: new Date() }));

app.use((_, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Parking API running on http://localhost:${PORT}`);
});