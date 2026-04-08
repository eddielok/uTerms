import { useEffect, useState } from 'react';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';

interface Policy {
  id: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export function useManagementPolicy(table: string) {
  const { userId } = useCookieConfig();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    supabase
      .from(table)
      .select('id, title, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error && error.code !== '42P01') console.error(error);
        setPolicies((data as Policy[]) || []);
        setIsLoading(false);
      });
  }, [userId, table]);

  const handleDelete = async (id: string, confirmText: string) => {
    if (!confirm(confirmText)) return;
    if (!userId) return;
    setDeletingId(id);
    await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
    setPolicies(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  return { policies, isLoading, deletingId, handleDelete };
}
