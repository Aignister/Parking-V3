CREATE DATABASE IF NOT EXISTS parking_db;

-- Parkings
CREATE TABLE IF NOT EXISTS parkings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(200),
  total_spots INTEGER NOT NULL DEFAULT 35,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the 3 parking lots
INSERT INTO parkings (name, description, total_spots) VALUES
  ('Parking 1', 'Estacionamiento Principal – Zonas A-D', 35),
  ('Parking 2', 'Estacionamiento Norte – Zonas E-H', 35),
  ('Parking 3', 'Estacionamiento Sur – Zonas I-L', 35)
ON CONFLICT DO NOTHING;

-- Spots
CREATE TABLE IF NOT EXISTS spots (
  id          SERIAL PRIMARY KEY,
  parking_id  INTEGER NOT NULL REFERENCES parkings(id) ON DELETE CASCADE,
  spot_code   VARCHAR(10) NOT NULL,
  spot_type   VARCHAR(20) NOT NULL DEFAULT 'standard',
  UNIQUE (parking_id, spot_code)
);

-- Access Log
CREATE TABLE IF NOT EXISTS access_logs (
  id BIGSERIAL PRIMARY KEY,
  parking_id INTEGER NOT NULL REFERENCES parkings(id) ON DELETE CASCADE,
  spot_code VARCHAR(10) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('entry','exit')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_parking_occurred
  ON access_logs (parking_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_logs_occurred
  ON access_logs (occurred_at DESC);

-- Spot State
CREATE TABLE IF NOT EXISTS spot_states (
  parking_id INTEGER NOT NULL REFERENCES parkings(id) ON DELETE CASCADE,
  spot_code VARCHAR(10) NOT NULL,
  is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parking_id, spot_code)
);

-- Daily stats
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  parking_id,
  DATE(occurred_at) AS day,
  COUNT(*) FILTER (WHERE action = 'entry') AS entries,
  COUNT(*) FILTER (WHERE action = 'exit') AS exits
FROM access_logs
GROUP BY parking_id, DATE(occurred_at);

-- Weekly stats
CREATE OR REPLACE VIEW weekly_stats AS
SELECT
  parking_id,
  DATE_TRUNC('week', occurred_at) AS week_start,
  COUNT(*) FILTER (WHERE action = 'entry') AS entries,
  COUNT(*) FILTER (WHERE action = 'exit') AS exits
FROM access_logs
GROUP BY parking_id, DATE_TRUNC('week', occurred_at);

-- Monthly stats
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  parking_id,
  DATE_TRUNC('month', occurred_at) AS month_start,
  COUNT(*) FILTER (WHERE action = 'entry') AS entries,
  COUNT(*) FILTER (WHERE action = 'exit') AS exits
FROM access_logs
GROUP BY parking_id, DATE_TRUNC('month', occurred_at);