import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';

interface Treatment {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  category: string;
  base_price: number;
  promotional_price: number;
  is_promotional: boolean;
  images: string[];
  video_url: string;
  button_color: string;
  is_active: boolean;
}

export const AdminTreatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subtitle: '',
    category: 'treatment',
    base_price: 0,
    promotional_price: 0,
    is_promotional: false,
    video_url: '',
    button_color: '#D4AF37',
    is_active: true
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('name');

      if (error) throw error;
      setTreatments(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tratamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTreatment) {
        const { error } = await supabase
          .from('treatments')
          .update(formData)
          .eq('id', editingTreatment.id);
        
        if (error) throw error;
        toast({ title: "Tratamento atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('treatments')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Tratamento criado com sucesso!" });
      }
      
      fetchTreatments();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tratamento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Tratamento excluído com sucesso!" });
      fetchTreatments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir tratamento",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormData({
      name: treatment.name,
      description: treatment.description || '',
      subtitle: treatment.subtitle || '',
      category: treatment.category,
      base_price: treatment.base_price,
      promotional_price: treatment.promotional_price || 0,
      is_promotional: treatment.is_promotional || false,
      video_url: treatment.video_url || '',
      button_color: treatment.button_color || '#D4AF37',
      is_active: treatment.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTreatment(null);
    setFormData({
      name: '',
      description: '',
      subtitle: '',
      category: 'treatment',
      base_price: 0,
      promotional_price: 0,
      is_promotional: false,
      video_url: '',
      button_color: '#D4AF37',
      is_active: true
    });
    setSelectedImages([]);
    setImagePreview([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast({
        title: "Limite excedido",
        description: "Você pode enviar no máximo 4 imagens",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedImages([...selectedImages, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Tratamentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-menu-gold text-menu-dark hover:bg-menu-gold/80">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tratamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTreatment ? 'Editar Tratamento' : 'Novo Tratamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="transformation">Transformation</SelectItem>
                      <SelectItem value="combos">Combos</SelectItem>
                      <SelectItem value="home_care">Home Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Preço Base (R$)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promotional_price">Preço Promocional (R$)</Label>
                  <Input
                    id="promotional_price"
                    type="number"
                    step="0.01"
                    value={formData.promotional_price}
                    onChange={(e) => setFormData({ ...formData, promotional_price: parseFloat(e.target.value) })}
                    disabled={!formData.is_promotional}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_color">Cor do Botão</Label>
                  <Input
                    id="button_color"
                    type="color"
                    value={formData.button_color}
                    onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="is_promotional"
                    checked={formData.is_promotional}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_promotional: checked })}
                  />
                  <Label htmlFor="is_promotional">Está em promoção</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Imagens do Tratamento (máximo 4)</Label>
                <div className="border-2 border-dashed border-admin-border rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-admin-text-muted mb-2" />
                    <span className="text-admin-text-muted">Clique para enviar imagens</span>
                  </label>
                  
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {editingTreatment ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {treatments.map((treatment) => (
          <Card key={treatment.id} className="bg-menu-gray">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-menu-white">{treatment.name}</CardTitle>
                  <p className="text-menu-gold">{treatment.subtitle}</p>
                  <p className="text-sm text-gray-400">
                    Categoria: {treatment.category} | Preço: R$ {treatment.base_price.toFixed(2)}
                    {treatment.is_promotional && treatment.promotional_price > 0 && (
                      <span className="text-green-500 ml-2">
                        Promoção: R$ {treatment.promotional_price.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(treatment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(treatment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">{treatment.description}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`text-xs px-2 py-1 rounded ${treatment.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {treatment.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: treatment.button_color }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};