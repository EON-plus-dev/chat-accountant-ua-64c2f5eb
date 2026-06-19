
CREATE TABLE public.institution_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_slug text NOT NULL,
  user_id uuid NOT NULL,
  rating smallint NOT NULL,
  text text,
  visit_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_institution_reviews_slug ON public.institution_reviews(institution_slug);
CREATE INDEX idx_institution_reviews_status ON public.institution_reviews(status);
CREATE INDEX idx_institution_reviews_user ON public.institution_reviews(user_id);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_institution_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_institution_review_rating
BEFORE INSERT OR UPDATE ON public.institution_reviews
FOR EACH ROW
EXECUTE FUNCTION public.validate_institution_review_rating();

-- Updated_at trigger
CREATE TRIGGER update_institution_reviews_updated_at
BEFORE UPDATE ON public.institution_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.institution_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published reviews or own"
ON public.institution_reviews
FOR SELECT
USING ((status = 'published') OR (user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert reviews"
ON public.institution_reviews
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
ON public.institution_reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
ON public.institution_reviews
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
ON public.institution_reviews
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
