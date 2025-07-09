import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  instagram: string;
  photo_url: string;
  plan_type: string;
  is_active: boolean;
  user_id: string;
}

interface SalonFormData {
  name: string;
  slug: string;
  phone: string;
  address: string;
  instagram: string;
  photo_url: string;
  plan_type: string;
  is_active: boolean;
}

export const useSalons = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSalons = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('name');

      if (error) throw error;
      setSalons(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar salões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const saveSalon = async (formData: SalonFormData, editingSalon?: Salon | null) => {
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const dataToSave = { ...formData, slug };

      if (editingSalon) {
        const { error } = await supabase
          .from('salons')
          .update(dataToSave)
          .eq('id', editingSalon.id);
        
        if (error) throw error;
        toast({ title: "Salão atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('salons')
          .insert([dataToSave]);
        
        if (error) throw error;
        toast({ title: "Salão criado com sucesso!" });
      }
      
      fetchSalons();
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar salão",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSalon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Salão excluído com sucesso!" });
      fetchSalons();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir salão",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  return {
    salons,
    loading,
    generateSlug,
    saveSalon,
    deleteSalon,
  };
};