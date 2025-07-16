
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useCepLookup } from '@/hooks/useCepLookup';

interface CepInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (data: {
    address: string;
    city: string;
    state: string;
    neighborhood: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const CepInput = ({ 
  value, 
  onChange, 
  onAddressFound, 
  placeholder = "CEP", 
  className 
}: CepInputProps) => {
  const { lookupCep, loading } = useCepLookup();

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length <= 8) {
      onChange(cep);
    }
  };

  const handleCepLookup = async () => {
    if (value.length === 8) {
      const addressData = await lookupCep(value);
      if (addressData && onAddressFound) {
        onAddressFound(addressData);
      }
    }
  };

  const formatCep = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={formatCep(value)}
        onChange={handleCepChange}
        placeholder={placeholder}
        className={className}
        maxLength={9}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleCepLookup}
        disabled={loading || value.length !== 8}
        className="flex-shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
