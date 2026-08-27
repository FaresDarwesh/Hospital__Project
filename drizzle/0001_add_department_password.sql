-- Department staff access: store only a one-way hash, never the plain password.
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS access_password_hash text NOT NULL DEFAULT '';
