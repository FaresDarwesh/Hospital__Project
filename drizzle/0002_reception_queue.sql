ALTER TABLE doctors ADD COLUMN IF NOT EXISTS queue_mode text NOT NULL DEFAULT 'exact';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_at timestamp;

ALTER TABLE doctors ADD CONSTRAINT doctors_queue_mode_check CHECK (queue_mode IN ('exact', 'arrival'));
CREATE INDEX IF NOT EXISTS appointments_checked_in_idx ON appointments (doctor_id, date, checked_in_at);
