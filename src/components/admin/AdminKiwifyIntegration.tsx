import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Copy, TestTube, Users, Settings } from 'lucide-react';
import { useKiwifyIntegration } from '@/hooks/useKiwifyIntegration';
import { useToast } from '@/hooks/use-toast';

interface KiwifySubscription {
  id: string;
  kiwify_order_id: string;
  customer_email: string;
  customer_name: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date?: string;
}

const AdminKiwifyIntegration = () => {
  const [subscriptions, setSubscriptions] = useState<KiwifySubscription[]>([]);
  const [testWebhookData, setTestWebhookData] = useState('');
  const { 
    loading, 
    getSubscriptions, 
    cancelSubscription, 
    testWebhook, 
    getWebhookUrl 
  } = useKiwifyIntegration();
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    const data = await getSubscriptions();
    setSubscriptions(data);
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(getWebhookUrl());
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência",
    });
  };

  const handleTestWebhook = async () => {
    try {
      const webhookData = JSON.parse(testWebhookData);
      await testWebhook(webhookData);
      loadSubscriptions(); // Recarregar após teste
    } catch (error) {
      toast({
        title: "Erro",
        description: "JSON inválido no teste do webhook",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    const success = await cancelSubscription(subscriptionId);
    if (success) {
      loadSubscriptions();
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'verificado_dourado':
        return 'bg-yellow-500';
      case 'verificado_azul':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'expired':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const defaultTestData = {
    order_id: "123456789",
    customer_id: "cust_123",
    customer_email: "teste@exemplo.com",
    customer_name: "Usuário Teste",
    product_id: "prod_basic",
    order_status: "paid",
    payment_status: "approved",
    order_date: new Date().toISOString(),
    product_name: "Plano Básico",
    plan_name: "basico"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Integração Kiwify</h2>
      </div>

      <Tabs defaultValue="webhook" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhook">Configuração</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle>URL do Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">URL para configurar na Kiwify:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="webhook-url"
                    value={getWebhookUrl()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyWebhookUrl} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Como configurar:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse o painel da Kiwify</li>
                  <li>Vá em Configurações → Webhooks</li>
                  <li>Adicione a URL acima</li>
                  <li>Configure para disparar nos eventos: "Compra Aprovada"</li>
                  <li>Certifique-se de que os produtos tenham nomes que incluam "verificado azul" ou "verificado dourado"</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assinaturas Ativas ({subscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma assinatura encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{subscription.customer_name}</h4>
                          <p className="text-sm text-gray-600">{subscription.customer_email}</p>
                          <p className="text-xs text-gray-500">
                            Pedido: {subscription.kiwify_order_id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPlanBadgeColor(subscription.plan_type)}>
                            {subscription.plan_type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusBadgeColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Início: {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
                        </span>
                        {subscription.status === 'active' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            disabled={loading}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Testar Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-data">Dados do Webhook (JSON):</Label>
                <Textarea
                  id="test-data"
                  value={testWebhookData}
                  onChange={(e) => setTestWebhookData(e.target.value)}
                  placeholder={JSON.stringify(defaultTestData, null, 2)}
                  className="font-mono text-sm"
                  rows={12}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestWebhook} 
                  disabled={loading || !testWebhookData}
                >
                  Testar Webhook
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setTestWebhookData(JSON.stringify(defaultTestData, null, 2))}
                >
                  Usar Dados de Exemplo
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Planos Suportados:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Básico:</strong> Qualquer produto (padrão)</li>
                  <li><strong>Verificado Azul:</strong> Produto com nome contendo "verificado azul"</li>
                  <li><strong>Verificado Dourado:</strong> Produto com nome contendo "verificado dourado"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminKiwifyIntegration;