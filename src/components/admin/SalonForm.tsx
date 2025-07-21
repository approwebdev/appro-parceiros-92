import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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

interface SalonFormProps {
  formData: SalonFormData;
  setFormData: (data: SalonFormData) => void;
  editingSalon: Salon | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  generateSlug: (name: string, editingSalonId?: string) => Promise<string>;
}

export const SalonForm = ({ 
  formData, 
  setFormData, 
  editingSalon, 
  onSubmit, 
  onCancel,
  generateSlug 
}: SalonFormProps) => {
  const [loadingAddress, setLoadingAddress] = useState(false);
  const { toast } = useToast();

  const handlePostalCodeBlur = async () => {
    if (formData.postal_code && formData.postal_code.length === 8) {
      setLoadingAddress(true);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${formData.postal_code}/json/`);
        if (response.data && !response.data.erro) {
          const addressData = response.data;
          setFormData({ 
            ...formData, 
            address: `${addressData.logradouro}, ${addressData.bairro}`,
            city: addressData.localidade,
            state: addressData.uf
          });
          toast({
            title: "CEP encontrado!",
            description: "Endereço preenchido automaticamente.",
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível buscar o endereço.",
          variant: "destructive"
        });
      } finally {
        setLoadingAddress(false);
      }
    }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={async (e) => {
              const newName = e.target.value;
              const newSlug = await generateSlug(newName, editingSalon?.id);
              setFormData({ 
                ...formData, 
                name: newName,
                slug: newSlug
              });
            }}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="gerado-automaticamente"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">CEP</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '') })}
            onBlur={handlePostalCodeBlur}
            maxLength={8}
            placeholder="00000000"
          />
          {loadingAddress && <p className="text-sm text-muted-foreground">Buscando endereço...</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address_number">Número</Label>
          <Input
            id="address_number"
            value={formData.address_number}
            onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
            placeholder="123"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Rua, bairro, cidade - UF"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address_complement">Complemento</Label>
        <Input
          id="address_complement"
          value={formData.address_complement}
          onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
          placeholder="Apartamento, sala, andar..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="São Paulo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="@nomedosalao"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plan_type">Plano</Label>
          <Select
            value={formData.plan_type}
            onValueChange={(value) => setFormData({ ...formData, plan_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basico">Básico</SelectItem>
              <SelectItem value="verificado_azul">Verificado Azul</SelectItem>
              <SelectItem value="verificado_dourado">Verificado Dourado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="photo_url">URL da Foto</Label>
          <Input
            id="photo_url"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Ativo</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingSalon ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};