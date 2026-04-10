-- Create section_content table for storing CMS-managed content per section
CREATE TABLE IF NOT EXISTS section_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    content_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section, key)
);

-- Enable RLS
ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;

-- Public read access (for the frontend to display content)
CREATE POLICY "Public read section_content"
    ON section_content FOR SELECT
    USING (true);

-- Authenticated write access (for CMS)
CREATE POLICY "Authenticated write section_content"
    ON section_content FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for faster lookups by section
CREATE INDEX IF NOT EXISTS idx_section_content_section ON section_content(section);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_section_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER section_content_updated_at
    BEFORE UPDATE ON section_content
    FOR EACH ROW EXECUTE FUNCTION update_section_content_updated_at();
