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
          wants_salon
        `)
        .eq('role', 'salon')
        .order('name');

      if (error) {
        
        throw error;
      }

      

      // Buscar salões separadamente para cada usuário que tem salão
      const formattedPartners: Partner[] = [];
      
      for (const profile of data || []) {
        let salon = undefined;
        
        if (profile.has_salon) {
          const { data: salonData, error: salonError } = await supabase
            .from('salons')
            .select('id, name, slug, address, is_active, plan_type')
            .eq('user_id', profile.user_id)
            .maybeSingle();
            
          if (salonError) {
            
          } else {
            salon = salonData;
          }
        }
        
        formattedPartners.push({
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          instagram: profile.instagram,
          has_salon: profile.has_salon,
          wants_salon: profile.wants_salon,
          salon
        });
      }

      
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