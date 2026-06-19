
-- ============================================================
-- 1. gov_branches — відділення державних органів
-- ============================================================
CREATE TYPE public.gov_branch_type AS ENUM ('main', 'regional', 'district', 'cnap', 'court', 'other');
CREATE TYPE public.gov_branch_status AS ENUM ('active', 'temporarily_closed', 'destroyed');

CREATE TABLE public.gov_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  branch_type gov_branch_type NOT NULL DEFAULT 'regional',
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  map_url TEXT,
  phones TEXT[] DEFAULT '{}',
  email TEXT,
  website TEXT,
  working_hours JSONB DEFAULT '{"weekdays": null, "saturday": null, "sunday": null}',
  is_open_24h BOOLEAN NOT NULL DEFAULT false,
  has_queue_system BOOLEAN NOT NULL DEFAULT false,
  has_accessibility BOOLEAN NOT NULL DEFAULT false,
  head_name TEXT,
  head_position TEXT,
  status gov_branch_status NOT NULL DEFAULT 'active',
  war_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_branches_agency ON public.gov_branches(agency_slug);
CREATE INDEX idx_gov_branches_city ON public.gov_branches(city);
CREATE INDEX idx_gov_branches_region ON public.gov_branches(region);
CREATE INDEX idx_gov_branches_status ON public.gov_branches(status);

ALTER TABLE public.gov_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active branches"
  ON public.gov_branches FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert branches"
  ON public.gov_branches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update branches"
  ON public.gov_branches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete branches"
  ON public.gov_branches FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_gov_branches_updated_at
  BEFORE UPDATE ON public.gov_branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. gov_services — послуги державних органів
-- ============================================================
CREATE TYPE public.gov_service_audience AS ENUM ('business', 'personal', 'both');

CREATE TABLE public.gov_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  audience gov_service_audience NOT NULL DEFAULT 'both',
  price TEXT,
  price_note TEXT,
  processing_time TEXT,
  is_online_available BOOLEAN NOT NULL DEFAULT false,
  online_url TEXT,
  legal_basis TEXT,
  requirements TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_services_agency ON public.gov_services(agency_slug);
CREATE INDEX idx_gov_services_audience ON public.gov_services(audience);

ALTER TABLE public.gov_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
  ON public.gov_services FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert services"
  ON public.gov_services FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update services"
  ON public.gov_services FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete services"
  ON public.gov_services FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_gov_services_updated_at
  BEFORE UPDATE ON public.gov_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. gov_service_docs — документи для послуги
-- ============================================================
CREATE TABLE public.gov_service_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.gov_services(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  how_to_get TEXT,
  template_url TEXT,
  note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_service_docs_service ON public.gov_service_docs(service_id);

ALTER TABLE public.gov_service_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service docs"
  ON public.gov_service_docs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert service docs"
  ON public.gov_service_docs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service docs"
  ON public.gov_service_docs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service docs"
  ON public.gov_service_docs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 4. gov_reviews — відгуки
-- ============================================================
CREATE TYPE public.gov_review_status AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE public.gov_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.gov_branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  visit_date DATE,
  service_id UUID REFERENCES public.gov_services(id) ON DELETE SET NULL,
  status gov_review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_reviews_branch ON public.gov_reviews(branch_id);
CREATE INDEX idx_gov_reviews_status ON public.gov_reviews(status);
CREATE INDEX idx_gov_reviews_user ON public.gov_reviews(user_id);

ALTER TABLE public.gov_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
  ON public.gov_reviews FOR SELECT
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert reviews"
  ON public.gov_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON public.gov_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON public.gov_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON public.gov_reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_gov_reviews_updated_at
  BEFORE UPDATE ON public.gov_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
