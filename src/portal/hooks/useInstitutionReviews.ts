import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useInstitutionRating(slug: string) {
  return useQuery({
    queryKey: ['institution-rating', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_reviews')
        .select('rating')
        .eq('institution_slug', slug)
        .eq('status', 'published');
      if (error) throw error;
      const ratings = data || [];
      if (ratings.length === 0) return { avg: 0, count: 0 };
      const sum = ratings.reduce((a, r) => a + r.rating, 0);
      return { avg: sum / ratings.length, count: ratings.length };
    },
  });
}

export function useInstitutionReviews(slug: string, page: number, pageSize = 5) {
  return useQuery({
    queryKey: ['institution-reviews', slug, page, pageSize],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('institution_reviews')
        .select('id, institution_slug, rating, text, visit_date, status, created_at, updated_at', { count: 'exact' })
        .eq('institution_slug', slug)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { reviews: data || [], totalCount: count ?? 0 };
    },
  });
}

export function useSubmitInstitutionReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      institution_slug: string;
      user_id: string;
      rating: number;
      text: string | null;
      visit_date: string | null;
    }) => {
      const { error } = await supabase.from('institution_reviews').insert(review);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['institution-reviews', vars.institution_slug] });
      qc.invalidateQueries({ queryKey: ['institution-rating', vars.institution_slug] });
    },
  });
}
