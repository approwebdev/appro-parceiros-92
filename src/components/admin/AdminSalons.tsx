import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Phone, MapPin, Instagram } from 'lucide-react';

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

export const AdminSalons = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    address: '',
    instagram: '',
    photo_url: '',
    plan_type: 'basico',
    is_active: true
  });

  useEffect(() => {
    fetchSalons();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar salão",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
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

  const openEditDialog = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      slug: salon.slug,
      phone: salon.phone || '',
      address: salon.address || '',
      instagram: salon.instagram || '',
      photo_url: salon.photo_url || '',
      plan_type: salon.plan_type || 'basico',
      is_active: salon.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSalon(null);
    setFormData({
      name: '',
      slug: '',
      phone: '',
      address: '',
      instagram: '',
      photo_url: '',
      plan_type: 'basico',
      is_active: true
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Salões</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-menu-gold text-menu-dark hover:bg-menu-gold/80">
              <Plus className="h-4 w-4 mr-2" />
              Novo Salão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSalon ? 'Editar Salão' : 'Novo Salão'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSalon ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {salons.map((salon) => (
          <Card key={salon.id} className="bg-menu-gray">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {salon.photo_url && (
                    <img 
                      src={salon.photo_url} 
                      alt={salon.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-menu-white">{salon.name}</CardTitle>
                    <p className="text-menu-gold">/{salon.slug}</p>
                    <p className="text-blue-400 text-sm">Plano: {salon.plan_type}</p>
                    {salon.address && (
                      <div className="flex items-center mt-1 text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{salon.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(salon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(salon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm">
                {salon.phone && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-1" />
                    {salon.phone}
                  </div>
                )}
                {salon.instagram && (
                  <div className="flex items-center text-gray-300">
                    <Instagram className="h-4 w-4 mr-1" />
                    {salon.instagram}
                  </div>
                )}
                <span className={`px-2 py-1 rounded text-xs ${salon.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {salon.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};