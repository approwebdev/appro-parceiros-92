import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SalonSidebar } from '@/components/salon/SalonSidebar';

const SalonPanelNew = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
                      onClick={() => alert('Funcionalidade em desenvolvimento')}
                    >
                      Desbloquear Salão
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'treatments':
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
              <CardHeader>
                <CardTitle className="text-admin-text">Meu Perfil</CardTitle>
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