import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Edit, Trash2, MapPin, Instagram } from 'lucide-react';
import { usePartners } from '@/hooks/usePartners';

interface Partner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  has_salon: boolean;
  wants_salon: boolean;
  salon?: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    is_active: boolean;
    plan_type?: string;
  };
}

export const AdminPartners = () => {
  const { partners, loading, refetch } = usePartners();
  const { toast } = useToast();

  const handleDeletePartner = async (partnerId: string) => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      try {
        // Primeiro, excluir do banco de dados de profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', partnerId);

        if (profileError) {
          console.error('Erro ao excluir profile:', profileError);
        }

        // Depois, excluir da autenticação do Supabase
        const { error: authError } = await supabase.auth.admin.deleteUser(partnerId);
        
        if (authError) {
          console.error('Erro ao excluir usuário da autenticação:', authError);
        }

        toast({
          title: "Parceiro excluído com sucesso!",
          description: "O parceiro foi removido do sistema.",
        });

        refetch();
      } catch (error) {
        console.error('Erro ao excluir parceiro:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir parceiro",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditPartner = (partnerId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de parceiros estará disponível em breve.",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Salões Parceiros</h2>
      </div>

      <div className="grid gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="bg-admin-card border-admin-border md:rounded-full">
            <CardHeader className="p-4">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src="" alt={partner.name} />
                        <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-admin-text text-lg truncate">{partner.name}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge 
                            className={
                              partner.has_salon 
                                ? "bg-green-100 text-green-800 text-xs" 
                                : partner.wants_salon 
                                  ? "bg-blue-100 text-blue-800 text-xs" 
                                  : "bg-gray-100 text-gray-800 text-xs"
                            }
                          >
                            {partner.has_salon ? 'Com Salão' : partner.wants_salon ? 'Quer Salão' : 'Parceiro'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-admin-text-muted">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{partner.email}</span>
                    </div>
                    {partner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{partner.phone}</span>
                      </div>
                    )}
                    {partner.instagram && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Instagram className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{partner.instagram}</span>
                      </div>
                    )}
                  </div>

                  {partner.salon && (
                    <div className="mt-3 p-3 bg-admin-surface rounded border-admin-border border">
                      <h4 className="font-medium text-admin-text mb-3 text-sm">Informações do Salão:</h4>
                      <div className="space-y-2 text-xs text-admin-text-muted">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Nome:</span> 
                            <span className="break-words ml-1">{partner.salon.name}</span>
                          </div>
                          <div>
                            <span className="font-medium">Slug:</span> 
                            <span className="break-words ml-1">{partner.salon.slug}</span>
                          </div>
                        </div>
                        {partner.salon.address && (
                          <div className="flex items-start gap-2 mt-2">
                            <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{partner.salon.address}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-3">
                          <Badge 
                            variant={partner.salon.is_active ? "default" : "secondary"}
                            className={`text-xs ${partner.salon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {partner.salon.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {partner.salon.plan_type === 'basico' ? 'Básico' :
                             partner.salon.plan_type === 'verificado_azul' ? 'Verificado Azul' :
                             partner.salon.plan_type === 'verificado_dourado' ? 'Verificado Dourado' :
                             'Básico'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2 self-start">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPartner(partner.id)}
                    className="flex-1 lg:flex-none"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="lg:hidden ml-2">Editar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePartner(partner.user_id)}
                    className="flex-1 lg:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="lg:hidden ml-2">Excluir</span>
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