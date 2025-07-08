import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  order_position: number;
}

export const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    order_position: 0,
    is_active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('salon_banners')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('salon_banners')
          .update(formData)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
        toast({ title: "Banner atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('salon_banners')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Banner criado com sucesso!" });
      }
      
      fetchBanners();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar banner",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salon_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Banner excluído com sucesso!" });
      fetchBanners();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir banner",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      order_position: banner.order_position,
      is_active: banner.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image_url: '',
      order_position: banners.length + 1,
      is_active: true
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Banners</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-menu-gold text-menu-dark hover:bg-menu-gold/80">
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order_position">Posição</Label>
                <Input
                  id="order_position"
                  type="number"
                  value={formData.order_position}
                  onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                  required
                />
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
                  {editingBanner ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id} className="bg-menu-gray">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {banner.image_url && (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-20 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-menu-white">{banner.title}</CardTitle>
                    <p className="text-menu-gold">Posição: {banner.order_position}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-300">
                  <Image className="h-4 w-4 mr-1" />
                  <span className="text-sm truncate max-w-xs">{banner.image_url}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${banner.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {banner.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};