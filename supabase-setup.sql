-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  date_of_birth TEXT,
  gender TEXT,
  blood_group TEXT,
  wallet_address TEXT,
  emergency_contact TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  registration_id TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can view own data" ON patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON patients
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON patients
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for hospitals table
CREATE POLICY "Hospitals can view own data" ON hospitals
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Hospitals can insert own data" ON hospitals
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Hospitals can update own data" ON hospitals
  FOR UPDATE USING (auth.uid() = id);