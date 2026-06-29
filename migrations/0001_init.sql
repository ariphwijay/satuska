CREATE TABLE IF NOT EXISTS site_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  description TEXT,
  tagline TEXT,
  niche TEXT,
  primary_monetization TEXT DEFAULT 'guest_post',
  module_local_seo INTEGER DEFAULT 0,
  module_affiliate INTEGER DEFAULT 1,
  module_multisite INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'draft',
  intent TEXT DEFAULT 'informational',
  monetization TEXT DEFAULT 'editorial',
  featured INTEGER DEFAULT 0,
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT,
  read_time TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  r2_key TEXT,
  url TEXT,
  alt_text TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_type TEXT DEFAULT 'guest_post',
  desired_package TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  site_url TEXT,
  target_url TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'received',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
