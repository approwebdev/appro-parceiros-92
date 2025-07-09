import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Bell, Settings } from 'lucide-react';
import { AdminTreatments } from '@/components/admin/AdminTreatments';
import { AdminPartners } from '@/components/admin/AdminPartners';
import { AdminBanners } from '@/components/admin/AdminBanners';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminSidebarNew } from '@/components/admin/AdminSidebarNew';
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

  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'treatments':
        return <AdminTreatments />;
      case 'salons':
        return <AdminPartners />;
      case 'categories':
        return <AdminCategories />;
      case 'banners':
        return <AdminBanners />;
      default:
        return <AdminTreatments />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-admin-content flex w-full">
        {/* Sidebar */}
        <AdminSidebarNew activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-admin-card border-b border-admin-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-admin-text" />
                <div>
                  <h1 className="text-2xl font-bold text-admin-text">
                    {activeTab === 'treatments' && 'Tratamentos'}
                    {activeTab === 'salons' && 'Salões Parceiros'}
                    {activeTab === 'categories' && 'Categorias'}
                    {activeTab === 'banners' && 'Banners'}
                  </h1>
                  <p className="text-admin-text-muted">
                    {activeTab === 'treatments' && 'Gerencie todos os tratamentos cadastrados'}
                    {activeTab === 'salons' && 'Visualize e gerencie todos os salões parceiros'}
                    {activeTab === 'categories' && 'Gerencie as categorias do carrossel do menu'}
                    {activeTab === 'banners' && 'Gerencie os banners promocionais'}
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
                <Button 
                  size="sm" 
                  className="bg-admin-success hover:bg-admin-success-hover text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
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

export default AdminPanel;