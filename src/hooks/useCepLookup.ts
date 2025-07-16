
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface AddressData {
  address: string;
  city: string;
  state: string;
  neighborhood: string;
}

export const useCepLookup = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const lookupCep = async (cep: string): Promise<AddressData | null> => {
    if (!cep || cep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: CepResponse = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto",
          variant: "destructive",
        });
        return null;
      }

      return {
        address: data.logradouro,
        city: data.localidade,
        state: data.uf,
        neighborhood: data.bairro,
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o CEP. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookupCep, loading };
};
