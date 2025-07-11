import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KiwifyWebhookData {
  order_id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  product_id: string;
  order_status: string;
  payment_status: string;
  order_date: string;
  product_name: string;
  plan_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const webhookData: KiwifyWebhookData = await req.json()
    
    console.log('Received Kiwify webhook:', webhookData)

    // Mapear o product_id ou plan_name para o tipo de plano
    let planType = 'basico'
    
    if (webhookData.product_name?.toLowerCase().includes('verificado dourado') || 
        webhookData.plan_name?.toLowerCase().includes('dourado')) {
      planType = 'verificado_dourado'
    } else if (webhookData.product_name?.toLowerCase().includes('verificado azul') ||
               webhookData.plan_name?.toLowerCase().includes('azul')) {
      planType = 'verificado_azul'
    }

    // Verificar se o pagamento foi aprovado
    if (webhookData.payment_status === 'approved' && webhookData.order_status === 'paid') {
      console.log('Payment approved, activating subscription for:', webhookData.customer_email)
      
      // Ativar assinatura usando a função do banco
      const { data, error } = await supabase.rpc('activate_kiwify_subscription', {
        p_email: webhookData.customer_email,
        p_name: webhookData.customer_name,
        p_kiwify_order_id: webhookData.order_id,
        p_kiwify_customer_id: webhookData.customer_id,
        p_product_id: webhookData.product_id,
        p_plan_type: planType,
        p_webhook_data: webhookData
      })

      if (error) {
        console.error('Error activating subscription:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to activate subscription' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Subscription activated successfully:', data)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription activated',
          subscription_id: data,
          plan_type: planType
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.log('Payment not approved or order not paid:', webhookData.payment_status, webhookData.order_status)
      
      return new Response(
        JSON.stringify({ 
          message: 'Payment not approved', 
          payment_status: webhookData.payment_status,
          order_status: webhookData.order_status
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})