
-- Bestånd (forest stands)
CREATE TABLE public.bestands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  namn TEXT NOT NULL DEFAULT 'Nytt bestånd',
  geometry JSONB NOT NULL DEFAULT '{"type":"Polygon","coordinates":[]}',
  areal NUMERIC DEFAULT 0,
  tradslag TEXT[] DEFAULT '{}',
  virkesvolym_per_ha NUMERIC DEFAULT 0,
  virkesvolym_totalt NUMERIC DEFAULT 0,
  alder INTEGER DEFAULT 0,
  bonitet TEXT DEFAULT '',
  slutenhet NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bestands ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth required per plan)
CREATE POLICY "Allow all select" ON public.bestands FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.bestands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.bestands FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.bestands FOR DELETE USING (true);

-- Åtgärder (actions/operations)
CREATE TABLE public.atgarder (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bestand_id UUID NOT NULL REFERENCES public.bestands(id) ON DELETE CASCADE,
  typ TEXT NOT NULL DEFAULT 'avverkning',
  planerat_datum DATE,
  tidsram TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planerad',
  anteckningar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.atgarder ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.atgarder FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.atgarder FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.atgarder FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.atgarder FOR DELETE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bestands_updated_at
  BEFORE UPDATE ON public.bestands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atgarder_updated_at
  BEFORE UPDATE ON public.atgarder
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
