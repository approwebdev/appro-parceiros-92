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
import { Badge } from '@/components/ui/badge';
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
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
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

  // Filter effect
  useEffect(() => {
    let filtered = treatments;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(treatment =>
        treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(treatment => treatment.category === filterCategory);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(treatment => 
        filterStatus === 'active' ? treatment.is_active : !treatment.is_active
      );
    }
    
    setFilteredTreatments(filtered);
  }, [treatments, searchTerm, filterCategory, filterStatus]);

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
      let imageUrls: string[] = [];
      
      // Upload das imagens se houver
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('treatment-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('treatment-images')
            .getPublicUrl(fileName);
            
          return publicUrl;
        });
        
        imageUrls = await Promise.all(uploadPromises);
      }

      const dataToSave = {
        ...formData,
        images: imageUrls.length > 0 ? imageUrls : (editingTreatment?.images || [])
      };
      
      if (editingTreatment) {
        const { error } = await supabase
          .from('treatments')
          .update(dataToSave)
          .eq('id', editingTreatment.id);
        
        if (error) throw error;
        toast({ title: "Tratamento atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('treatments')
          .insert([dataToSave]);
        
        if (error) throw error;
        toast({ title: "Tratamento criado com sucesso!" });
      }
      
      fetchTreatments();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar tratamento:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar tratamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* Filtros */}
      <Card className="bg-admin-card border-admin-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por nome</Label>
              <Input
                id="search"
                placeholder="Digite o nome do tratamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-admin-card border-admin-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filter-category">Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-admin-card border-admin-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="transformation">Transformation</SelectItem>
                  <SelectItem value="combos">Combos</SelectItem>
                  <SelectItem value="home_care">Home Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-admin-card border-admin-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-admin-text-muted">
            Mostrando {filteredTreatments.length} de {treatments.length} tratamentos
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTreatments.map((treatment) => (
          <Card key={treatment.id} className="bg-admin-card border-admin-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {treatment.images && treatment.images.length > 0 ? (
                      <img 
                        src={treatment.images[0]} 
                        alt={treatment.name}
                        className="w-20 h-16 rounded border object-cover"
                      />
                    ) : (
                      <div className="w-20 h-16 rounded border bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        Sem foto
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle className="text-admin-text">{treatment.name}</CardTitle>
                    {treatment.subtitle && (
                      <p className="text-admin-text-muted text-sm">{treatment.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium text-admin-text">
                        R$ {treatment.base_price.toFixed(2)}
                        {treatment.is_promotional && treatment.promotional_price > 0 && (
                          <span className="text-green-600 ml-2">
                            (Promoção: R$ {treatment.promotional_price.toFixed(2)})
                          </span>
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {treatment.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    treatment.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {treatment.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  {treatment.is_promotional && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Promoção
                    </Badge>
                  )}
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
          </Card>
        ))}
      </div>
    </div>
  );
};