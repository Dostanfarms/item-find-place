
ALTER TABLE public.admin_employees
  ADD COLUMN IF NOT EXISTS face_reference_url text,
  ADD COLUMN IF NOT EXISTS face_enrolled_at timestamptz;

ALTER TABLE public.delivery_partners
  ADD COLUMN IF NOT EXISTS face_reference_url text,
  ADD COLUMN IF NOT EXISTS face_enrolled_at timestamptz;

INSERT INTO storage.buckets (id, name, public)
VALUES ('face-references', 'face-references', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Service role manages face references" ON storage.objects;
CREATE POLICY "Service role manages face references"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'face-references')
WITH CHECK (bucket_id = 'face-references');
