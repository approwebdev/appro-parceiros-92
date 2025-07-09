import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Package, MapPin, Building, Home, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SalonSidebar } from '@/components/salon/SalonSidebarNew';
import { SalonInfoForm } from '@/components/salon/SalonInfoForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const salonSchema = z.object({
  name: z.string().min(1, 'Nome do salão é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_complement: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional()
});

const SalonPanelNew = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreatingSalon, setIsCreatingSalon] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [createSalonOpen, setCreateSalonOpen] = useState(false);
  const [editSalonOpen, setEditSalonOpen] = useState(false);
  const [salonData, setSalonData] = useState(null);
  const [treatmentsData, setTreatmentsData] = useState([]);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [editTreatmentOpen, setEditTreatmentOpen] = useState(false);
  const [menuLink, setMenuLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalonData = async () => {
      if (user && profile?.has_salon) {
        try {
          const { data: salon, error } = await supabase
            .from('salons')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (salon && !error) {
            setSalonData(salon);
            
            // Buscar tratamentos do salão
            const { data: treatments, error: treatmentsError } = await supabase
              .from('salon_treatments')
              .select(`
                *,
                treatment:treatments(*)
              `)
              .eq('salon_id', salon.id);

            if (treatments && !treatmentsError) {
              setTreatmentsData(treatments);
            }

            // Gerar link do menu
            setMenuLink(`${window.location.origin}/menu/${salon.slug}`);
          }
        } catch (error) {
          console.error('Error fetching salon:', error);
        }
      }
    };

    fetchSalonData();
  }, [user, profile]);

  const salonEditForm = useForm({
    defaultValues: {
      name: salonData?.name || '',
      address: salonData?.address || '',
      phone: salonData?.phone || '',
      instagram: salonData?.instagram || ''
    }
  });

  const salonForm = useForm<z.infer<typeof salonSchema>>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      name: `Salão ${profile?.name}` || '',
      address: profile?.address || '',
      address_number: profile?.address_number || '',
      address_complement: profile?.address_complement || '',
      postal_code: profile?.postal_code || '',
      phone: profile?.phone || '',
      instagram: profile?.instagram || ''
    }
  });

  const profileForm = useForm({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      instagram: profile?.instagram || ''
    }
  });

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

  const handleCreateSalon = async (data: z.infer<typeof salonSchema>) => {
    setIsCreatingSalon(true);
    try {
      const { data: salon, error } = await supabase
        .from('salons')
        .insert({
          user_id: user.id,
          name: data.name,
          responsible_name: profile.name,
          responsible_email: profile.email,
          slug: `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          phone: data.phone,
          address: `${data.address}, ${data.address_number}${data.address_complement ? ` - ${data.address_complement}` : ''}`,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar o profile para indicar que tem salão
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ has_salon: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Salão desbloqueado!",
        description: "Seu salão foi criado com sucesso. Agora você pode gerenciar seus tratamentos.",
      });

      setCreateSalonOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao criar salão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o salão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingSalon(false);
    }
  };

  const handleUpdateSalon = async (data: any) => {
    try {
      const updateData: any = {
        name: data.name,
        address: data.address,
        instagram: data.instagram
      };

      if (data.phone) {
        updateData.phone = data.phone.replace(/\D/g, '');
      }

      if (data.photo_url) {
        updateData.photo_url = data.photo_url;
      }

      const { error } = await supabase
        .from('salons')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Salão atualizado!",
        description: "As informações do salão foram salvas com sucesso.",
      });

      setSalonData(prev => prev ? { ...prev, ...updateData } : prev);
    } catch (error) {
      console.error('Erro ao atualizar salão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o salão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          instagram: data.instagram
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      setEditProfileOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTreatment = async (data: any) => {
    try {
      const { error } = await supabase
        .from('salon_treatments')
        .update({
          custom_price: parseFloat(data.custom_price),
          is_active: data.is_active
        })
        .eq('id', editingTreatment.id);

      if (error) throw error;

      toast({
        title: "Tratamento atualizado!",
        description: "As informações do tratamento foram salvas com sucesso.",
      });

      setEditTreatmentOpen(false);
      
      // Recarregar dados
      if (salonData) {
        const { data: treatments } = await supabase
          .from('salon_treatments')
          .select(`
            *,
            treatment:treatments(*)
          `)
          .eq('salon_id', salonData.id);
        
        if (treatments) {
          setTreatmentsData(treatments);
          setMenuLink(`${window.location.origin}/menu/${salonData.slug}`);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar tratamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tratamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const openEditTreatment = (treatment: any) => {
    setEditingTreatment(treatment);
    setEditTreatmentOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-text">Dashboard do Salão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-admin-text-muted">
                  Bem-vindo ao seu painel de controle! Aqui você pode gerenciar seu salão.
                </p>
                {!profile.has_salon ? (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Desbloqueie seu salão</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Você ainda não tem um salão ativo. Clique no botão abaixo para cadastrar seu salão.
                    </p>
                    <Dialog open={createSalonOpen} onOpenChange={setCreateSalonOpen}>
                      <DialogTrigger asChild>
                        <Button className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white">
                          Desbloquear Salão
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Salão</DialogTitle>
                        </DialogHeader>
                        <Form {...salonForm}>
                          <form onSubmit={salonForm.handleSubmit(handleCreateSalon)} className="space-y-4">
                            <FormField
                              control={salonForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Salão *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome do seu salão" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={salonForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Endereço *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rua, Avenida..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex gap-2">
                              <FormField
                                control={salonForm.control}
                                name="address_number"
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>Número *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={salonForm.control}
                                name="postal_code"
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>CEP</FormLabel>
                                    <FormControl>
                                      <Input placeholder="00000-000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={salonForm.control}
                              name="address_complement"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Apartamento, sala..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={salonForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(11) 99999-9999" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={salonForm.control}
                              name="instagram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram</FormLabel>
                                  <FormControl>
                                    <Input placeholder="@seuinstagram" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setCreateSalonOpen(false)}>
                                Cancelar
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                disabled={isCreatingSalon}
                              >
                                {isCreatingSalon ? 'Criando...' : 'Criar Salão'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-800">✅ Salão Ativo</h4>
                          <p className="text-green-700 text-sm mt-1">
                            Seu salão está ativo e funcionando! 
                          </p>
                        </div>
                        {salonData && (
                          <SalonInfoForm
                            salon={salonData}
                            onUpdate={handleUpdateSalon}
                          />
                        )}
                      </div>
                      
                      {salonData && (
                        <div className="mt-3 space-y-2">
                          <p className="text-green-700 text-sm">
                            <strong>Nome:</strong> {salonData.name}
                          </p>
                          <p className="text-green-700 text-sm">
                            <strong>Endereço:</strong> {salonData.address}
                          </p>
                          {salonData.phone && (
                            <p className="text-green-700 text-sm">
                              <strong>Telefone:</strong> {salonData.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                     
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-admin-card border-admin-border">
                        <CardHeader>
                          <CardTitle className="text-admin-text flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Total de Tratamentos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-admin-success">
                            {treatmentsData.length}
                          </p>
                          <p className="text-admin-text-muted text-sm">
                            Tratamentos disponíveis
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-admin-card border-admin-border">
                        <CardHeader>
                          <CardTitle className="text-admin-text flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Tratamentos Ativos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {treatmentsData.filter(t => t.is_active).length}
                          </p>
                          <p className="text-admin-text-muted text-sm">
                            Visíveis no menu
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-admin-card border-admin-border md:col-span-2 lg:col-span-1">
                        <CardHeader>
                          <CardTitle className="text-admin-text flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Link do Menu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs text-admin-text-muted break-all bg-gray-50 p-2 rounded font-mono">
                              {menuLink}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                navigator.clipboard.writeText(menuLink);
                                toast({
                                  title: "Link copiado!",
                                  description: "O link do menu foi copiado para a área de transferência.",
                                });
                              }}
                            >
                              Copiar Link
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'treatments':
        return (
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-text">Gerenciar Tratamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {treatmentsData.length === 0 ? (
                <p className="text-admin-text-muted">Nenhum tratamento encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {treatmentsData.map((treatment) => (
                    <Card key={treatment.id} className="bg-admin-card border-admin-border">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {treatment.treatment?.images && treatment.treatment.images.length > 0 ? (
                                <img 
                                  src={treatment.treatment.images[0]} 
                                  alt={treatment.treatment.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-admin-border"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-admin-bg rounded-lg border border-admin-border flex items-center justify-center">
                                  <Package className="h-8 w-8 text-admin-text-muted" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-admin-text">{treatment.treatment?.name}</CardTitle>
                              <p className="text-admin-text-muted text-sm">
                                Preço: R$ {Number(treatment.custom_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {treatment.is_active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inativo
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditTreatment(treatment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'profile':
        return (
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-text">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-admin-text-muted">Nome</Label>
                    <p className="text-admin-text font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <Label className="text-admin-text-muted">Email</Label>
                    <p className="text-admin-text font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-admin-text-muted">Telefone</Label>
                    <p className="text-admin-text font-medium">{profile.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-admin-text-muted">Instagram</Label>
                    <p className="text-admin-text font-medium">{profile.instagram || 'Não informado'}</p>
                  </div>
                </div>

                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-admin-success hover:bg-admin-success-hover text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <FormControl>
                                <Input placeholder="@seuinstagram" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-admin-success hover:bg-admin-success-hover text-white">
                            Salvar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-admin-content">
        {/* Desktop Sidebar */}
        <SalonSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <div className="flex flex-col">
            {/* Mobile Header */}
            <div className="flex h-16 items-center border-b border-admin-border px-4 lg:hidden">
              <SidebarTrigger />
              <h1 className="ml-4 text-lg font-semibold text-admin-text">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'treatments' && 'Tratamentos'}
                {activeTab === 'profile' && 'Meu Perfil'}
              </h1>
            </div>

            {/* Content */}
            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </div>
        </SidebarInset>

        {/* Edit Treatment Dialog */}
        <Dialog open={editTreatmentOpen} onOpenChange={setEditTreatmentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Tratamento</DialogTitle>
            </DialogHeader>
            {editingTreatment && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateTreatment({
                    custom_price: formData.get('custom_price'),
                    is_active: formData.get('is_active') === 'on'
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Nome do Tratamento</Label>
                  <Input value={editingTreatment.treatment?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_price">Preço (R$)</Label>
                  <Input
                    id="custom_price"
                    name="custom_price"
                    type="number"
                    step="0.01"
                    defaultValue={editingTreatment.custom_price}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingTreatment.is_active}
                  />
                  <Label htmlFor="is_active">Ativo no menu</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditTreatmentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-admin-success hover:bg-admin-success-hover text-white">
                    Salvar
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default SalonPanelNew;