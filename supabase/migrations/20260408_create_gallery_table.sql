-- Create a table for gallery images
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    image_url TEXT NOT NULL,
    section TEXT NOT NULL, -- 'hero', 'about', 'services', 'testimonials', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users
CREATE POLICY "Allow authenticated users full access to gallery" ON public.gallery
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to gallery" ON public.gallery
FOR SELECT TO public USING (true);
