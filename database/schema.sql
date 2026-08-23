CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','writer','admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  writer_mode VARCHAR(20) CHECK (writer_mode IN ('public','private')),
  referral_code VARCHAR(40) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(40) UNIQUE;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  registration_credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  withdrawable_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  withdrawable BOOLEAN NOT NULL DEFAULT FALSE,
  reference VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  job_id VARCHAR(120),
  assignment_title VARCHAR(200),
  subject VARCHAR(120) DEFAULT 'General',
  academic_level VARCHAR(60) DEFAULT 'Undergraduate',
  word_count INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 0,
  referencing_style VARCHAR(40) DEFAULT 'APA',
  deadline TIMESTAMPTZ,
  writer_payment NUMERIC(12,2) DEFAULT 0,
  priority VARCHAR(30) DEFAULT 'Normal',
  client_files JSONB DEFAULT '[]'::jsonb,
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  writer_id UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  submission_content TEXT,
  submission_files JSONB DEFAULT '[]'::jsonb,
  submission_date TIMESTAMPTZ,
  revision_instructions TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS job_id VARCHAR(120);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignment_title VARCHAR(200);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subject VARCHAR(120) DEFAULT 'General';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS academic_level VARCHAR(60) DEFAULT 'Undergraduate';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS referencing_style VARCHAR(40) DEFAULT 'APA';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS writer_payment NUMERIC(12,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(30) DEFAULT 'Normal';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS revision_instructions TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'info',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(40) DEFAULT 'info';

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);