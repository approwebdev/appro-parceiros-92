import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Edit, Save, Plus, Search } from 'lucide-react';
import { SalonSidebar } from '@/components/salon/SalonSidebar';

interface Salon {
  id: string;
  name: string;
  phone: string;
  address: string;
  photo_url: string;
  responsible_name: string;
  is_active: boolean;
}

interface SalonTreatment {
  id: string;
  custom_price: number;
  is_active: boolean;
  treatment: {
    id: string;
    name: string;
    description: string;
    base_price: number;
  };
}

const SalonPanel = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salonTreatments, setSalonTreatments] = useState<SalonTreatment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('salon-info');
  const [salonForm, setSalonForm] = useState({
    name: '',
    phone: '',
    address: '',
    photo_url: '',
    responsible_name: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'salon') {
      fetchSalonData();
    }
  }, [user, profile]);

  useEffect(() => {
    if (salon?.id) {
      fetchSalonTreatments();
    }
  }, [salon]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-content">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-admin-success"></div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'salon') {
    return <Navigate to="/auth" replace />;
  }

  const fetchSalonData = async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSalon(data);
        setSalonForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          photo_url: data.photo_url || '',
          responsible_name: data.responsible_name || '',
          is_active: data.is_active
        });
      }
    } catch (error) {
      console.error('Error fetching salon:', error);
    }
  };

  const fetchSalonTreatments = async () => {
    if (!salon?.id) return;

    try {
      const { data, error } = await supabase
        .from('salon_treatments')
        .select(`
          id,
          custom_price,
          is_active,
          treatment:treatments(id, name, description, base_price)
        `)
        .eq('salon_id', salon.id);

      if (error) throw error;
      setSalonTreatments(data || []);
    } catch (error) {
      console.error('Error fetching salon treatments:', error);
    }
  };

  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (salon) {
        const { error } = await supabase
          .from('salons')
          .update(salonForm)
          .eq('id', salon.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('salons')
          .insert([{
            ...salonForm,
            user_id: user?.id,
            slug: salonForm.name.toLowerCase().replace(/\s+/g, '-')
          }])
          .select()
          .single();
        
        if (error) throw error;
        setSalon(data);
      }
      
      toast({ title: "Informações salvas com sucesso!" });
      setIsEditing(false);
      fetchSalonData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações",
        variant: "destructive",
      });
    }
  };

  const updateTreatmentPrice = async (treatmentId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('salon_treatments')
        .update({ custom_price: newPrice })
        .eq('id', treatmentId);
      
      if (error) throw error;
      toast({ title: "Preço atualizado com sucesso!" });
      fetchSalonTreatments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar preço",
        variant: "destructive",
      });
    }
  };

  const toggleTreatmentActive = async (treatmentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('salon_treatments')
        .update({ is_active: isActive })
        .eq('id', treatmentId);
      
      if (error) throw error;
      toast({ title: "Status atualizado com sucesso!" });
      fetchSalonTreatments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const renderSalonInfo = () => (
    <Card className="bg-admin-card border-admin-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-admin-text">Informações do Salão</CardTitle>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
            className="border-admin-border text-admin-text hover:bg-admin-success hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSalonSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-admin-text">Nome do Salão</Label>
                <Input
                  id="name"
                  value={salonForm.name}
                  onChange={(e) => setSalonForm({ ...salonForm, name: e.target.value })}
                  required
                  className="border-admin-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-admin-text">Telefone</Label>
                <Input
                  id="phone"
                  value={salonForm.phone}
                  onChange={(e) => setSalonForm({ ...salonForm, phone: e.target.value })}
                  className="border-admin-border"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsible_name" className="text-admin-text">Nome do Responsável</Label>
                <Input
                  id="responsible_name"
                  value={salonForm.responsible_name}
                  onChange={(e) => setSalonForm({ ...salonForm, responsible_name: e.target.value })}
                  className="border-admin-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-admin-text">Endereço</Label>
                <Input
                  id="address"
                  value={salonForm.address}
                  onChange={(e) => setSalonForm({ ...salonForm, address: e.target.value })}
                  className="border-admin-border"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo_url" className="text-admin-text">URL da Foto</Label>
              <Input
                id="photo_url"
                value={salonForm.photo_url}
                onChange={(e) => setSalonForm({ ...salonForm, photo_url: e.target.value })}
                className="border-admin-border"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={salonForm.is_active}
                onCheckedChange={(checked) => setSalonForm({ ...salonForm, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-admin-text">Salão Ativo</Label>
            </div>
            
            <Button type="submit" className="bg-admin-success hover:bg-admin-success-hover text-white">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </form>
        ) : (
          <div className="space-y-2 text-admin-text">
            <p><strong>Nome:</strong> {salon?.name || 'Não informado'}</p>
            <p><strong>Responsável:</strong> {salon?.responsible_name || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {salon?.phone || 'Não informado'}</p>
            <p><strong>Endereço:</strong> {salon?.address || 'Não informado'}</p>
            <p><strong>Status:</strong> {salon?.is_active ? 'Ativo' : 'Inativo'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTreatments = () => (
    <Card className="bg-admin-card border-admin-border">
      <CardHeader>
        <CardTitle className="text-admin-text">Meus Tratamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salonTreatments.map((salonTreatment) => (
            <div key={salonTreatment.id} className="border border-admin-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-admin-text">{salonTreatment.treatment.name}</h4>
                  <p className="text-admin-text-muted text-sm">{salonTreatment.treatment.description}</p>
                  <p className="text-admin-success text-sm">Preço sugerido: R$ {salonTreatment.treatment.base_price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={salonTreatment.is_active}
                    onCheckedChange={(checked) => toggleTreatmentActive(salonTreatment.id, checked)}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`price-${salonTreatment.id}`} className="text-admin-text">Meu preço:</Label>
                  <Input
                    id={`price-${salonTreatment.id}`}
                    type="number"
                    step="0.01"
                    value={salonTreatment.custom_price}
                    onChange={(e) => updateTreatmentPrice(salonTreatment.id, parseFloat(e.target.value))}
                    className="w-32 border-admin-border"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'salon-info':
        return renderSalonInfo();
      case 'treatments':
        return renderTreatments();
      case 'settings':
        return (
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-text">Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-admin-text-muted">Configurações em desenvolvimento...</p>
            </CardContent>
          </Card>
        );
      default:
        return renderSalonInfo();
    }
  };

  return (
    <div className="min-h-screen bg-admin-content flex">
      {/* Sidebar */}
      <SalonSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-admin-card border-b border-admin-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-admin-text">
                {activeTab === 'salon-info' && 'Informações do Salão'}
                {activeTab === 'treatments' && 'Meus Tratamentos'}
                {activeTab === 'settings' && 'Configurações'}
              </h1>
              <p className="text-admin-text-muted">
                {activeTab === 'salon-info' && 'Gerencie as informações do seu salão'}
                {activeTab === 'treatments' && 'Gerencie os tratamentos oferecidos'}
                {activeTab === 'settings' && 'Configurações gerais do sistema'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                <Input 
                  placeholder="Buscar..."
                  className="pl-10 w-80 bg-admin-card border-admin-border"
                />
              </div>
              {activeTab === 'treatments' && (
                <Button 
                  size="sm" 
                  className="bg-admin-success hover:bg-admin-success-hover text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SalonPanel;