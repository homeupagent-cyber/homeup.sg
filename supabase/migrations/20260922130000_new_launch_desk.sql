-- New Launch Desk (Phase 1): access logging and login rate limiting.
-- Both tables are written only by the service-role client from server routes —
-- there is no end-user Supabase session on these unauthenticated/pre-auth requests.

CREATE TABLE new_launch_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  mobile_number text NOT NULL,
  user_agent text,
  ip_hash text
);

CREATE INDEX new_launch_access_log_created_at_idx ON new_launch_access_log (created_at DESC);

ALTER TABLE new_launch_access_log ENABLE ROW LEVEL SECURITY;

-- No public policies: all access via service role in API routes

CREATE TABLE new_launch_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text NOT NULL
);

CREATE INDEX new_launch_login_attempts_ip_created_idx
  ON new_launch_login_attempts (ip_hash, created_at DESC);

ALTER TABLE new_launch_login_attempts ENABLE ROW LEVEL SECURITY;

-- No public policies: all access via service role in API routes
