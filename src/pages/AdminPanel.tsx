import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Bell, Settings, Package, Users, Grid3x3, Image, UserCog, ClipboardList } from 'lucide-react';
import { AdminTreatments } from '@/components/admin/AdminTreatments';
import { AdminPartners } from '@/components/admin/AdminPartners';
import { AdminSalons } from '@/components/admin/AdminSalons';
import { AdminBanners } from '@/components/admin/AdminBanners';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminAccessRequests } from '@/components/admin/AdminAccessRequests';
import { AdminSidebarNew } from '@/components/admin/AdminSidebarNew';
import AdminKiwifyIntegration from '@/components/admin/AdminKiwifyIntegration';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const AdminPanel = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('treatments');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-content">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-admin-success"></div>
      </div>
    );
  }

  if (!user || !profile || !['admin', 'collaborator'].includes(profile.role)) {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'treatments':
        return <AdminTreatments />;
      case 'salons':
        return <AdminSalons />;
      case 'categories':
        return <AdminCategories />;
      case 'banners':
        return <AdminBanners />;
      case 'access-requests':
        return profile?.role === 'admin' ? <AdminAccessRequests /> : <AdminTreatments />;
      case 'users':
        return profile?.role === 'admin' ? <AdminUsers /> : <AdminTreatments />;
      case 'kiwify':
        return profile?.role === 'admin' ? <AdminKiwifyIntegration /> : <AdminTreatments />;
      default:
        return <AdminTreatments />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-admin-content flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebarNew activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Top Header - Desktop */}
          <header className="hidden md:block bg-admin-card border-b border-admin-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-admin-text" />
                <div>
                  <h1 className="text-2xl font-bold text-admin-text">
                    {activeTab === 'treatments' && 'Tratamentos'}
                    {activeTab === 'salons' && 'Salões Parceiros'}
                    {activeTab === 'categories' && 'Categorias'}
                    {activeTab === 'banners' && 'Banners'}
                    {activeTab === 'access-requests' && 'Solicitações de Acesso'}
                    {activeTab === 'users' && 'Usuários'}
                    {activeTab === 'kiwify' && 'Integração Kiwify'}
                  </h1>
                  <p className="text-admin-text-muted">
                    {activeTab === 'treatments' && 'Gerencie todos os tratamentos cadastrados'}
                    {activeTab === 'salons' && 'Visualize e gerencie todos os salões parceiros'}
                    {activeTab === 'categories' && 'Gerencie as categorias do carrossel do menu'}
                    {activeTab === 'banners' && 'Gerencie os banners promocionais'}
                    {activeTab === 'access-requests' && 'Aprove ou rejeite solicitações de acesso'}
                    {activeTab === 'users' && 'Gerencie todos os usuários do sistema'}
                    {activeTab === 'kiwify' && 'Configure a integração com a plataforma Kiwify'}
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

          {/* Mobile Header */}
          <header className="md:hidden bg-admin-card border-b border-admin-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-admin-text">
                {activeTab === 'treatments' && 'Tratamentos'}
                {activeTab === 'salons' && 'Salões'}
                {activeTab === 'categories' && 'Categorias'}
                {activeTab === 'banners' && 'Banners'}
                {activeTab === 'access-requests' && 'Solicitações'}
                {activeTab === 'users' && 'Usuários'}
              </h1>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                <Input 
                  placeholder="Buscar..."
                  className="pl-8 w-32 bg-admin-card border-admin-border text-sm"
                />
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {renderContent()}
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-admin-sidebar border-t border-admin-border z-50">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'treatments', label: 'Tratamentos', icon: Package },
              { id: 'salons', label: 'Salões', icon: Users },
              { id: 'categories', label: 'Categorias', icon: Grid3x3 },
              { id: 'banners', label: 'Banners', icon: Image },
              ...(profile?.role === 'admin' ? [
                { id: 'access-requests', label: 'Solicitações', icon: ClipboardList },
                { id: 'users', label: 'Usuários', icon: UserCog }
              ] : [])
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-admin-sidebar-active' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;