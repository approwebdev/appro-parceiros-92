import { usePartners } from '@/hooks/usePartners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Phone, Instagram, MapPin, Edit, Trash2 } from 'lucide-react';

export const AdminPartners = () => {
  const { partners, loading, refetch } = usePartners();
  const { toast } = useToast();

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    try {
      // Buscar o user_id do partner
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) return;

      // Excluir o usuário da autenticação (isso também excluirá o profile via trigger)
      const { error } = await supabase.auth.admin.deleteUser(partner.user_id);
      
      if (error) throw error;
      
      toast({ title: "Parceiro excluído com sucesso!" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir parceiro",
        variant: "destructive",
      });
    }
  };

  const handleEditPartner = (partnerId: string) => {
    // Por enquanto, apenas um placeholder - você pode implementar um modal de edição
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de parceiros será implementada em breve.",
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Parceiros</h2>
      </div>

      <div className="grid gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="bg-admin-card border-admin-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-admin-text">{partner.name}</CardTitle>
                    {partner.has_salon ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Com Salão
                      </Badge>
                    ) : partner.wants_salon ? (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Quer Salão
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Parceiro
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-admin-text-muted space-y-1">
                    <p className="flex items-center gap-2">
                      <span>Email:</span> {partner.email}
                    </p>
                    {partner.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {partner.phone}
                      </p>
                    )}
                    {partner.instagram && (
                      <p className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        {partner.instagram}
                      </p>
                    )}
                  </div>

                  {partner.salon && (
                    <div className="mt-3 p-3 bg-admin-surface rounded border-admin-border border">
                      <h4 className="font-medium text-admin-text mb-2">Informações do Salão:</h4>
                      <div className="space-y-1 text-sm text-admin-text-muted">
                        <p><strong>Nome:</strong> {partner.salon.name}</p>
                        <p><strong>Slug:</strong> {partner.salon.slug}</p>
                        {partner.salon.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {partner.salon.address}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={partner.salon.is_active ? "default" : "secondary"}
                            className={partner.salon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {partner.salon.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline">
                            {partner.salon.plan_type || 'Básico'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPartner(partner.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePartner(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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