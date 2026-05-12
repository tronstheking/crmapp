-- Create Tables for Instagram CRM

-- 1. Tags Table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#CBD5E1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'Nuevo Lead' CHECK (status IN ('Nuevo Lead', 'Contactado', 'Interesado', 'Cliente')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Contact Tags (Junction Table)
CREATE TABLE contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- 4. Interactions Table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dm', 'comment')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Content Calendar Table
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('post', 'reel', 'story')),
  caption TEXT,
  hashtags TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'programado' CHECK (status IN ('programado', 'publicado', 'fallido')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Simplified for now
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow authenticated access)
CREATE POLICY "Allow all for authenticated" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON contact_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON interactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON content_calendar FOR ALL USING (auth.role() = 'authenticated');
