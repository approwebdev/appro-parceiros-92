import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LogOut } from 'lucide-react';
import { AdminTreatments } from '@/components/admin/AdminTreatments';
import { AdminSalons } from '@/components/admin/AdminSalons';
import { AdminBanners } from '@/components/admin/AdminBanners';

const AdminPanel = () => {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-menu-gold"></div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-menu-dark text-menu-white">
      {/* Header */}
      <header className="bg-menu-dark border-b border-menu-gold/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-menu-gray">Bem-vindo, {profile.name}</p>
          </div>
          <Button 
            onClick={signOut}
            variant="outline"
            className="border-menu-gold text-menu-gold hover:bg-menu-gold hover:text-menu-dark"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="treatments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-menu-gray">
            <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
            <TabsTrigger value="salons">Salões</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="treatments" className="mt-6">
            <AdminTreatments />
          </TabsContent>
          
          <TabsContent value="salons" className="mt-6">
            <AdminSalons />
          </TabsContent>
          
          <TabsContent value="banners" className="mt-6">
            <AdminBanners />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;