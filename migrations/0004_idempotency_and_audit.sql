CREATE TABLE IF NOT EXISTS request_idempotency (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at_iso TEXT DEFAULT (datetime('now')),
  UNIQUE(action, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_request_idempotency_expires_at
  ON request_idempotency(expires_at);

CREATE TABLE IF NOT EXISTS admin_mutation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  summary TEXT NOT NULL,
  payload_json TEXT,
  actor_label TEXT DEFAULT 'admin',
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_mutation_logs_created_at
  ON admin_mutation_logs(created_at DESC);
