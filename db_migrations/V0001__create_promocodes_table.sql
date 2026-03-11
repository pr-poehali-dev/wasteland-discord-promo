CREATE TABLE t_p80821412_wasteland_discord_pr.promocodes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  discord_invite VARCHAR(255),
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
