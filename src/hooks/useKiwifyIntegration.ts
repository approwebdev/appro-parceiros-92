import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useKiwifyIntegration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kiwify_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KiwifySubscription[];
    } catch (error) {
      
      toast({
        title: "Erro",
        description: "Erro ao buscar assinaturas",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('kiwify_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'cancelled',
          subscription_plan: 'basico'
        })
        .eq('kiwify_subscription_id', subscriptionId);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: "Assinatura cancelada com sucesso",
      });

      return true;
    } catch (error) {
      
      toast({
        title: "Erro",
        description: "Erro ao cancelar assinatura",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (webhookData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kiwify-webhook', {
        body: webhookData,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook testado com sucesso",
      });

      return data;
    } catch (error) {
      
      toast({
        title: "Erro",
        description: "Erro ao testar webhook",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWebhookUrl = () => {
    return 'https://vibhcunfdtdosqzalnqx.supabase.co/functions/v1/kiwify-webhook';
  };

  return {
    loading,
    getSubscriptions,
    cancelSubscription,
    testWebhook,
    getWebhookUrl,
  };
};