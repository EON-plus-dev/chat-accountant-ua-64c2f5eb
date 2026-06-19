CREATE POLICY "Admins can insert consultations" ON public.consultations
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update consultations" ON public.consultations
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));