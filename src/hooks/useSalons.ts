import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Salon {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
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
  city: string;
  state: string;
  postal_code: string;
  address_number: string;
  address_complement: string;
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

  const generateSlug = async (name: string, editingSalonId?: string) => {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Verificar se o slug já existe
    const { data: existingSalons, error } = await supabase
      .from('salons')
      .select('slug, id')
      .ilike('slug', `${baseSlug}%`);
    
    if (error) {
      console.error('Erro ao verificar slugs:', error);
      return baseSlug;
    }
    
    // Filtrar salões existentes (excluindo o que está sendo editado)
    const filteredSalons = existingSalons?.filter(salon => salon.id !== editingSalonId) || [];
    
    // Se não existe slug igual, retornar o slug base
    if (!filteredSalons.some(salon => salon.slug === baseSlug)) {
      return baseSlug;
    }
    
    // Se existe, encontrar o próximo número disponível
    let counter = 1;
    let newSlug = `${baseSlug}${counter}`;
    
    while (filteredSalons.some(salon => salon.slug === newSlug)) {
      counter++;
      newSlug = `${baseSlug}${counter}`;
    }
    
    return newSlug;
  };

  const saveSalon = async (formData: SalonFormData, editingSalon?: Salon | null) => {
    try {
      const slug = formData.slug || await generateSlug(formData.name, editingSalon?.id);
      
      // Remover campos que não existem na tabela e processar endereço completo
      const { address_number, address_complement, ...salonData } = formData;
      
      // Combinar endereço com número se fornecido
      let fullAddress = salonData.address;
      if (address_number) {
        fullAddress = `${salonData.address}, ${address_number}`;
      }
      if (address_complement) {
        fullAddress = `${fullAddress}, ${address_complement}`;
      }
      
      // Obter o ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const dataToSave = { 
        ...salonData, 
        slug,
        address: fullAddress,
        user_id: user?.id || null // Adicionar user_id para evitar violação de RLS
      };

      if (editingSalon) {
        console.log('Atualizando salão:', editingSalon.id, 'com dados:', dataToSave);
        const { data, error } = await supabase
          .from('salons')
          .update(dataToSave)
          .eq('id', editingSalon.id)
          .select();
        
        if (error) {
          console.error('Erro ao atualizar salão:', error);
          throw error;
        }
        
        console.log('Salão atualizado:', data);
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