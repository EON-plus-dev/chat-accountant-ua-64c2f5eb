import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type GovBranch = Tables<'gov_branches'>;
export type GovService = Tables<'gov_services'>;
export type GovServiceDoc = Tables<'gov_service_docs'>;
export type GovReview = Tables<'gov_reviews'>;

interface BranchFilters {
  agencySlug?: string;
  city?: string;
  region?: string;
  status?: string;
  search?: string;
}

export function useGovBranches(filters: BranchFilters = {}) {
  return useQuery({
    queryKey: ['gov-branches', filters],
    queryFn: async () => {
      let query = supabase
        .from('gov_branches')
        .select('*')
        .order('city', { ascending: true });

      if (filters.agencySlug) query = query.eq('agency_slug', filters.agencySlug);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.region) query = query.eq('region', filters.region);
      if (filters.status) query = query.eq('status', filters.status as any);
      else query = query.eq('status', 'active');
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as GovBranch[];
    },
  });
}

export function useGovBranch(id: string | undefined) {
  return useQuery({
    queryKey: ['gov-branch', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('gov_branches')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as GovBranch;
    },
    enabled: !!id,
  });
}

export function useGovServices(agencySlug?: string) {
  return useQuery({
    queryKey: ['gov-services', agencySlug],
    queryFn: async () => {
      let query = supabase
        .from('gov_services')
        .select('*, gov_service_docs(*)')
        .order('sort_order', { ascending: true });

      if (agencySlug) query = query.eq('agency_slug', agencySlug);

      const { data, error } = await query;
      if (error) throw error;
      return data as (GovService & { gov_service_docs: GovServiceDoc[] })[];
    },
  });
}

export function useGovBranchReviews(branchId: string | undefined, page = 0, pageSize = 5) {
  return useQuery({
    queryKey: ['gov-reviews', branchId, page, pageSize],
    queryFn: async () => {
      if (!branchId) return { reviews: [] as GovReview[], totalCount: 0 };
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('gov_reviews')
        .select('id, branch_id, rating, text, visit_date, service_id, status, created_at, updated_at', { count: 'exact' })
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { reviews: (data ?? []) as GovReview[], totalCount: count ?? 0 };
    },
    enabled: !!branchId,
  });
}

export function useGovCities() {
  return useQuery({
    queryKey: ['gov-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gov_branches')
        .select('city')
        .eq('status', 'active');
      if (error) throw error;
      const cityCount = new Map<string, number>();
      (data || []).forEach((r) => cityCount.set(r.city, (cityCount.get(r.city) || 0) + 1));
      return Array.from(cityCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

export function useGovBranchRating(branchId: string | undefined) {
  return useQuery({
    queryKey: ['gov-branch-rating', branchId],
    queryFn: async () => {
      if (!branchId) return { avg: 0, count: 0 };
      const { data, error } = await supabase
        .from('gov_reviews')
        .select('rating')
        .eq('branch_id', branchId)
        .eq('status', 'published');
      if (error) throw error;
      if (!data || data.length === 0) return { avg: 0, count: 0 };
      const sum = data.reduce((s, r) => s + r.rating, 0);
      return { avg: sum / data.length, count: data.length };
    },
    enabled: !!branchId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: TablesInsert<'gov_reviews'>) => {
      const { data, error } = await supabase.from('gov_reviews').insert(review).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gov-reviews', data.branch_id] });
      queryClient.invalidateQueries({ queryKey: ['gov-branch-rating', data.branch_id] });
    },
  });
}
