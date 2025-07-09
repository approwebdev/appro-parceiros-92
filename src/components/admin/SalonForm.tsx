import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface SalonFormProps {
  formData: SalonFormData;
  setFormData: (data: SalonFormData) => void;
  editingSalon: Salon | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  generateSlug: (name: string) => string;
}

export const SalonForm = ({ 
  formData, 
  setFormData, 
  editingSalon, 
  onSubmit, 
  onCancel,
  generateSlug 
}: SalonFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                name: e.target.value,
                slug: generateSlug(e.target.value)
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
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
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
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
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