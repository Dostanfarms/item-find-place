
-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  redirect_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint to ensure at least one media URL is provided
ALTER TABLE public.banners ADD CONSTRAINT banners_media_check 
CHECK (image_url IS NOT NULL OR video_url IS NOT NULL);

-- Create index for active banners ordered by display_order
CREATE INDEX idx_banners_active_order ON public.banners (is_active, display_order) WHERE is_active = true;

-- Enable RLS (though for admin management, we'll keep it simple)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policy for full access (since this is admin functionality)
CREATE POLICY "Enable all access for banners" ON public.banners
FOR ALL USING (true) WITH CHECK (true);
