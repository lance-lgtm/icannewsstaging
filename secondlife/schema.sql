-- TSUGU — D1 schema for the community layer (accounts, follows, messages).
-- Apply with: wrangler d1 execute <DB_NAME> --remote --file=schema.sql
-- (drop --remote to apply to your local dev database instead)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- A row is a follow *request* from follower_id to followee_id.
-- status='pending' until the followee accepts (-> 'accepted') or rejects
-- (row deleted). The followee can also later delete an accepted row to
-- remove that follower; the follower can delete their own row to unfollow.
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL REFERENCES users(id),
  followee_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK(status IN ('pending', 'accepted')),
  created_at INTEGER NOT NULL,
  UNIQUE(follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id, status);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id, status);

-- Messaging is only allowed between two users with an accepted follow
-- relationship in either direction (see functions/_lib/social.js).
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id),
  recipient_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(sender_id, recipient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at);

-- Fixed-window request counters for functions/api/analyze.js's rate limit.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
