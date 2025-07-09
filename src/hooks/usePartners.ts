import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  has_salon: boolean;
  wants_salon: boolean;
  salon?: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    is_active: boolean;
    plan_type?: string;
  };
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          email,
          phone,
          instagram,
          has_salon,
          wants_salon,
          salons:salons!user_id (
            id,
            name,
            slug,
            address,
            is_active,
            plan_type
          )
        `)
        .eq('role', 'salon')
        .order('name');

      if (error) throw error;

      const formattedPartners: Partner[] = data.map((profile: any) => ({
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        instagram: profile.instagram,
        has_salon: profile.has_salon,
        wants_salon: profile.wants_salon,
        salon: profile.salons && profile.salons.length > 0 ? profile.salons[0] : undefined
      }));

      setPartners(formattedPartners);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar parceiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return {
    partners,
    loading,
    refetch: fetchPartners
  };
};