import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SalonSidebar } from '@/components/salon/SalonSidebarNew';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const SalonPanelNew = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreatingSalon, setIsCreatingSalon] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { toast } = useToast();

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

  const handleUnlockSalon = async () => {
    setIsCreatingSalon(true);
    try {
      const { data: salon, error } = await supabase
        .from('salons')
        .insert({
          user_id: user.id,
          name: `Salão ${profile.name}`,
          responsible_name: profile.name,
          responsible_email: profile.email,
          slug: `salon-${profile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          phone: profile.phone,
          address: profile.address ? `${profile.address}, ${profile.address_number || ''}` : null,
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
                {!profile.has_salon && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Desbloqueie seu salão</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Você ainda não tem um salão ativo. Clique no botão abaixo para cadastrar seu salão.
                    </p>
                    <Button 
                      className="mt-3 bg-admin-success hover:bg-admin-success-hover text-white"
                      onClick={handleUnlockSalon}
                      disabled={isCreatingSalon}
                    >
                      {isCreatingSalon ? 'Criando...' : 'Desbloquear Salão'}
                    </Button>
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
                      className="bg-admin-success hover:bg-admin-success-hover text-white"
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
                <p className="text-admin-text-muted">
                  Gerencie os tratamentos do seu salão.
                </p>
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
                          <Button type="submit" className="bg-admin-success hover:bg-admin-success-hover">
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