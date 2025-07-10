import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, User, Phone, Mail, Building } from 'lucide-react';

interface AccessRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  salon_name: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  plan_type: string;
  created_at: string;
}

export const AdminAccessRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as AccessRequest[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações de acesso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: AccessRequest, planType: string) => {
    try {
      // Update access request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          plan_type: planType,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Update user profile to grant access
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'salon',
          has_salon: true,
          status: 'approved'
        })
        .eq('user_id', request.user_id);

      if (profileError) throw profileError;

      // Create salon if salon_name is provided
      if (request.salon_name) {
        const slug = request.salon_name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim() + '-' + Date.now();

        const { error: salonError } = await supabase
          .from('salons')
          .insert([
            {
              user_id: request.user_id,
              name: request.salon_name,
              slug: slug,
              phone: request.phone,
              address: request.address,
              plan_type: planType,
              is_active: true,
              responsible_name: request.name,
              responsible_email: request.email
            }
          ]);

        if (salonError) throw salonError;
      }

      toast({
        title: "Solicitação aprovada",
        description: `Acesso liberado para ${request.name}`,
      });

      fetchAccessRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar solicitação",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update user profile status to rejected
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'rejected'
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi rejeitada",
      });

      fetchAccessRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar solicitação",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Solicitações de Acesso</h2>
        <Badge variant="outline" className="text-sm">
          {requests.filter(r => r.status === 'pending').length} pendentes
        </Badge>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="bg-admin-card border-admin-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {request.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Solicitado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{request.email}</span>
                </div>
                
                {request.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{request.phone}</span>
                  </div>
                )}
                
                {request.salon_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{request.salon_name}</span>
                  </div>
                )}
                
                {request.address && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <span className="text-gray-600">Endereço:</span>
                    <span>{request.address}</span>
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Select onValueChange={(planType) => handleApproveRequest(request, planType)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecionar plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="verificado_azul">Verificado Azul</SelectItem>
                      <SelectItem value="verificado_dourado">Verificado Dourado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectRequest(request.id, request.user_id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card className="bg-admin-card border-admin-border">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-600">
                As solicitações de acesso aparecerão aqui quando usuários se cadastrarem.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};