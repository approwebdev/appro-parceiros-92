import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Package, MapPin, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SalonSidebar } from '@/components/salon/SalonSidebarNew';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
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

  // Debug logs
  console.log('SalonPanelNew - user:', user);
  console.log('SalonPanelNew - profile:', profile);
  console.log('SalonPanelNew - profile.has_salon:', profile?.has_salon);

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

          console.log('Fetched salon data:', salon);
          console.log('Salon fetch error:', error);

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

            console.log('Fetched treatments data:', treatments);
            console.log('Treatments fetch error:', treatmentsError);

            if (treatments && !treatmentsError) {
              setTreatmentsData(treatments);
            }

            // Gerar link do menu
            const activetreatments = treatments?.filter(t => t.is_active) || [];
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
      instagram: profile?.instagram || '',
      address: profile?.address || '',
      address_number: profile?.address_number || '',
      address_complement: profile?.address_complement || '',
      postal_code: profile?.postal_code || ''
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
      // Recarregar a página para atualizar o contexto
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
      const { error } = await supabase
        .from('salons')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          instagram: data.instagram
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Salão atualizado!",
        description: "As informações do salão foram salvas com sucesso.",
      });

      setEditSalonOpen(false);
      window.location.reload();
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
          instagram: data.instagram,
          address: data.address,
          address_number: data.address_number,
          address_complement: data.address_complement,
          postal_code: data.postal_code
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
          // Atualizar link do menu
          const activetreatments = treatments.filter(t => t.is_active);
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
                        <Button 
                          className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
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
                        <Dialog open={editSalonOpen} onOpenChange={setEditSalonOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Editar Salão
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Salão</DialogTitle>
                            </DialogHeader>
                            <Form {...salonEditForm}>
                              <form onSubmit={salonEditForm.handleSubmit(handleUpdateSalon)} className="space-y-4">
                                <FormField
                                  control={salonEditForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome do Salão</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nome do salão" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={salonEditForm.control}
                                  name="address"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Endereço</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Endereço completo" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={salonEditForm.control}
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
                                  control={salonEditForm.control}
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
                                  <Button type="button" variant="outline" onClick={() => setEditSalonOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    Salvar
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
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

                      <Card className="bg-admin-card border-admin-border">
                        <CardHeader>
                          <CardTitle className="text-admin-text flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Link do Menu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs text-admin-text-muted break-all bg-gray-50 p-2 rounded">
                              {menuLink}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
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

                    {/* Seção de Tratamentos */}
                    <Card className="bg-admin-card border-admin-border mt-6">
                      <CardHeader>
                        <CardTitle className="text-admin-text">Meus Tratamentos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {treatmentsData.length === 0 ? (
                          <p className="text-admin-text-muted">Nenhum tratamento encontrado.</p>
                        ) : (
                          <div className="space-y-4">
                            {treatmentsData.map((treatment) => (
                              <div key={treatment.id} className="border border-admin-border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      {treatment.treatment?.images && treatment.treatment.images.length > 0 ? (
                                        <img 
                                          src={treatment.treatment.images[0]} 
                                          alt={treatment.treatment.name}
                                          className="w-16 h-12 rounded border object-cover"
                                        />
                                      ) : (
                                        <div className="w-16 h-12 rounded border bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                          Sem imagem
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-medium text-admin-text">
                                          {treatment.treatment?.name || 'Tratamento sem nome'}
                                        </h4>
                                        <p className="text-admin-text-muted text-sm">
                                          Categoria: {treatment.treatment?.category || 'Sem categoria'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-admin-success font-bold">
                                            R$ {treatment.custom_price?.toFixed(2) || '0.00'}
                                          </span>
                                          {treatment.treatment?.base_price && (
                                            <span className="text-xs text-admin-text-muted">
                                              (Base: R$ {treatment.treatment.base_price.toFixed(2)})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      treatment.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {treatment.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditTreatment(treatment)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Dialog para editar tratamento */}
                    <Dialog open={editTreatmentOpen} onOpenChange={setEditTreatmentOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Tratamento</DialogTitle>
                        </DialogHeader>
                        {editingTreatment && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            handleUpdateTreatment({
                              custom_price: formData.get('custom_price'),
                              is_active: formData.get('is_active') === 'on'
                            });
                          }} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Nome do Tratamento</label>
                              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                {editingTreatment.treatment?.name}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="custom_price" className="text-sm font-medium">Preço Personalizado (R$)</label>
                              <Input
                                id="custom_price"
                                name="custom_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={editingTreatment.custom_price || editingTreatment.treatment?.base_price || 0}
                                required
                              />
                              <div className="text-xs text-gray-500">
                                Preço base: R$ {editingTreatment.treatment?.base_price?.toFixed(2) || '0.00'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is_active"
                                name="is_active"
                                defaultChecked={editingTreatment.is_active}
                              />
                              <label htmlFor="is_active" className="text-sm font-medium">
                                Ativo (visível no menu)
                              </label>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setEditTreatmentOpen(false)}>
                                Cancelar
                              </Button>
                              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                Salvar Alterações
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'treatments':
        if (!profile.has_salon) {
          return (
            <div className="space-y-6">
              <Card className="bg-admin-card border-admin-border">
                <CardHeader>
                  <CardTitle className="text-admin-text">Tratamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-admin-text-muted mb-4">
                      Você precisa desbloquear seu salão para acessar os tratamentos.
                    </p>
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      Ir para Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-text">Tratamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-admin-text-muted">
                    Gerencie os tratamentos do seu salão. Total: {treatmentsData.length} tratamentos ativos
                  </p>
                  
                  {treatmentsData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {treatmentsData.map((salonTreatment) => (
                        <Card key={salonTreatment.id} className="border">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-admin-text">{salonTreatment.treatment.name}</h4>
                            <p className="text-sm text-admin-text-muted mt-1 line-clamp-2">
                              {salonTreatment.treatment.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-lg font-bold text-green-600">
                                R$ {salonTreatment.custom_price}
                              </p>
                              <Button size="sm" variant="outline">
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-admin-text-muted">
                        Nenhum tratamento encontrado. Os tratamentos são criados automaticamente quando o salão é desbloqueado.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-admin-text">Meu Perfil</CardTitle>
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
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
                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua, Avenida..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <FormField
                            control={profileForm.control}
                            name="address_number"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
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
                          control={profileForm.control}
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
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                            Salvar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-admin-text-muted">
                    <strong>Nome:</strong> {profile.name}
                  </p>
                  <p className="text-admin-text-muted">
                    <strong>Email:</strong> {profile.email}
                  </p>
                  {profile.phone && (
                    <p className="text-admin-text-muted">
                      <strong>Telefone:</strong> {profile.phone}
                    </p>
                  )}
                  {profile.instagram && (
                    <p className="text-admin-text-muted">
                      <strong>Instagram:</strong> {profile.instagram}
                    </p>
                  )}
                  {profile.address && (
                    <p className="text-admin-text-muted">
                      <strong>Endereço:</strong> {profile.address}{profile.address_number && `, ${profile.address_number}`}
                      {profile.address_complement && ` - ${profile.address_complement}`}
                    </p>
                  )}
                  {profile.postal_code && (
                    <p className="text-admin-text-muted">
                      <strong>CEP:</strong> {profile.postal_code}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-text">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-admin-text-muted">Selecione uma opção no menu lateral.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-admin-content flex w-full">
        {/* Sidebar */}
        <SalonSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-admin-card border-b border-admin-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-admin-text" />
                <div>
                  <h1 className="text-2xl font-bold text-admin-text">
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'treatments' && 'Tratamentos'}
                    {activeTab === 'profile' && 'Meu Perfil'}
                  </h1>
                  <p className="text-admin-text-muted">
                    {activeTab === 'dashboard' && 'Gerencie seu salão'}
                    {activeTab === 'treatments' && 'Configure os tratamentos do seu salão'}
                    {activeTab === 'profile' && 'Gerencie suas informações pessoais'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                  <Input 
                    placeholder="Buscar..."
                    className="pl-10 w-80 bg-admin-card border-admin-border"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SalonPanelNew;