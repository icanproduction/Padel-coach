-- App Settings table for storing logo URL and other app configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default values
INSERT INTO app_settings (key, value) VALUES ('app_name', 'Loop Padel Club') ON CONFLICT (key) DO NOTHING;
INSERT INTO app_settings (key, value) VALUES ('logo_url', null) ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read app_settings" ON app_settings FOR SELECT USING (true);

-- Only admin can update
CREATE POLICY "Admin can update app_settings" ON app_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can insert app_settings" ON app_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create storage bucket for app assets (logo etc)
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read app-assets" ON storage.objects FOR SELECT USING (bucket_id = 'app-assets');
CREATE POLICY "Admin upload app-assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'app-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update app-assets" ON storage.objects FOR UPDATE USING (
  bucket_id = 'app-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete app-assets" ON storage.objects FOR DELETE USING (
  bucket_id = 'app-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
