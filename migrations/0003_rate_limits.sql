CREATE TABLE IF NOT EXISTS request_rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(action, key)
);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_reset_at
  ON request_rate_limits(reset_at);
