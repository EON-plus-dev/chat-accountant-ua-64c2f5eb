import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useUpsertBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (branch: TablesInsert<'gov_branches'> & { id?: string }) => {
      if (branch.id) {
        const { id, ...rest } = branch;
        const { error } = await supabase.from('gov_branches').update(rest as TablesUpdate<'gov_branches'>).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gov_branches').insert(branch);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-branches'] }); toast.success('Збережено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_branches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-branches'] }); toast.success('Видалено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpsertService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (svc: TablesInsert<'gov_services'> & { id?: string }) => {
      if (svc.id) {
        const { id, ...rest } = svc;
        const { error } = await supabase.from('gov_services').update(rest as TablesUpdate<'gov_services'>).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gov_services').insert(svc);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-services'] }); toast.success('Збережено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-services'] }); toast.success('Видалено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status, table = 'gov_reviews' }: { ids: string[]; status: 'published' | 'rejected'; table?: 'gov_reviews' | 'institution_reviews' }) => {
      const { error } = await supabase.from(table).update({ status }).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-reviews'] }); qc.invalidateQueries({ queryKey: ['institution-reviews-admin'] }); toast.success('Оновлено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, table = 'gov_reviews' }: { id: string; table?: 'gov_reviews' | 'institution_reviews' }) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gov-reviews'] }); qc.invalidateQueries({ queryKey: ['institution-reviews-admin'] }); toast.success('Видалено'); },
    onError: (e: Error) => toast.error(e.message),
  });
}
