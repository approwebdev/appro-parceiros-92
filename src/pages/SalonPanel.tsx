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
import { LogOut, Edit, Save, Plus, Search, Copy, ExternalLink } from 'lucide-react';
import { SalonSidebar } from '@/components/salon/SalonSidebar';

interface Salon {
  id: string;
  name: string;
  phone: string;
  address: string;
  photo_url: string;
  responsible_name: string;
  responsible_email: string;
  plan: string;
  slug: string;
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
    responsible_email: '',
    plan: 'basico',
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
          responsible_email: data.responsible_email || '',
          plan: data.plan || 'basico',
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

  const copyMenuLink = async () => {
    if (!salon?.slug) {
      toast({
        title: "Erro",
        description: "Salão não encontrado ou sem slug definido.",
        variant: "destructive",
      });
      return;
    }

    const menuUrl = `${window.location.origin}/menu/${salon.slug}`;
    
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast({
        title: "Link copiado!",
        description: "O link do seu menu foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente selecionar e copiar manualmente.",
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
                <Label htmlFor="responsible_email" className="text-admin-text">Email do Responsável</Label>
                <Input
                  id="responsible_email"
                  type="email"
                  value={salonForm.responsible_email}
                  onChange={(e) => setSalonForm({ ...salonForm, responsible_email: e.target.value })}
                  className="border-admin-border"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-admin-text">Endereço</Label>
                <Input
                  id="address"
                  value={salonForm.address}
                  onChange={(e) => setSalonForm({ ...salonForm, address: e.target.value })}
                  className="border-admin-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-admin-text">Plano</Label>
                <select
                  id="plan"
                  value={salonForm.plan}
                  onChange={(e) => setSalonForm({ ...salonForm, plan: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-admin-border bg-background px-3 py-2 text-sm"
                >
                  <option value="basico">Plano Básico</option>
                  <option value="verificado_azul">Verificado Azul</option>
                  <option value="verificado_dourado">Verificado Dourado</option>
                </select>
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
            <p><strong>Email do Responsável:</strong> {salon?.responsible_email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {salon?.phone || 'Não informado'}</p>
            <p><strong>Endereço:</strong> {salon?.address || 'Não informado'}</p>
            <p><strong>Plano:</strong> {
              salon?.plan === 'basico' ? 'Plano Básico' :
              salon?.plan === 'verificado_azul' ? 'Verificado Azul' :
              salon?.plan === 'verificado_dourado' ? 'Verificado Dourado' :
              'Não informado'
            }</p>
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

  const renderMenuLink = () => {
    const menuUrl = salon?.slug ? `${window.location.origin}/menu/${salon.slug}` : '';
    
    return (
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-text">Link do Menu Digital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {salon?.slug ? (
            <>
              <div className="space-y-2">
                <Label className="text-admin-text">URL do seu menu digital:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={menuUrl}
                    readOnly
                    className="border-admin-border bg-admin-content"
                  />
                  <Button onClick={copyMenuLink} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => window.open(menuUrl, '_blank')}
                    variant="outline" 
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-admin-content p-4 rounded-lg border border-admin-border">
                <h4 className="font-medium text-admin-text mb-2">Como usar seu link:</h4>
                <ul className="text-admin-text-muted text-sm space-y-1">
                  <li>• Compartilhe este link com seus clientes</li>
                  <li>• Adicione em suas redes sociais</li>
                  <li>• Imprima um QR Code para seu estabelecimento</li>
                  <li>• O link é atualizado automaticamente quando você edita as informações</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-admin-text-muted mb-4">
                Complete as informações do seu salão para gerar o link do menu digital.
              </p>
              <Button 
                onClick={() => setActiveTab('salon-info')}
                className="bg-admin-success hover:bg-admin-success-hover text-white"
              >
                Completar Informações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'salon-info':
        return renderSalonInfo();
      case 'menu-link':
        return renderMenuLink();
      case 'treatments':
        return renderTreatments();
      default:
        return renderSalonInfo();
    }
  };

  return (
    <div className="min-h-screen bg-admin-content flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, overlay on tablet */}
      <div className="lg:block">
        <SalonSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-admin-card border-b border-admin-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-2xl font-bold text-admin-text truncate">
                {activeTab === 'salon-info' && 'Informações do Salão'}
                {activeTab === 'menu-link' && 'Link do Menu Digital'}
                {activeTab === 'treatments' && 'Meus Tratamentos'}
              </h1>
              <p className="text-sm text-admin-text-muted hidden sm:block">
                {activeTab === 'salon-info' && 'Gerencie as informações do seu salão'}
                {activeTab === 'menu-link' && 'Acesse e compartilhe o link do seu menu digital'}
                {activeTab === 'treatments' && 'Gerencie os tratamentos oferecidos'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                <Input 
                  placeholder="Buscar..."
                  className="pl-10 w-40 lg:w-80 bg-admin-card border-admin-border"
                />
              </div>
              {activeTab === 'treatments' && (
                <Button 
                  size="sm" 
                  className="bg-admin-success hover:bg-admin-success-hover text-white"
                >
                  <Plus className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Adicionar</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SalonPanel;