import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Tratamento de CORS para requisições do navegador
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { userId, message, heading, sendAfter, send_after } = await req.json()

        if (!userId || !message) {
            return new Response(
                JSON.stringify({ error: 'Os parâmetros userId e message são obrigatórios' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')
        const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')

        if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
            console.error("Variáveis de ambiente do OneSignal não configuradas.");
            return new Response(
                JSON.stringify({ error: 'Erro de configuração do servidor' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Montando o payload para a API do OneSignal
        const payload: any = {
            app_id: ONESIGNAL_APP_ID,
            include_aliases: {
                external_id: [userId]
            },
            target_channel: "push",
            contents: { pt: message, en: message }
        }

        if (heading) {
            payload.headings = { pt: heading, en: heading }
        }

        if (sendAfter || send_after) {
            payload.send_after = sendAfter || send_after
        }

        console.log("Enviando push via OneSignal:", payload);

        const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(payload)
        })

        const data = await res.json()

        console.log("Resposta do OneSignal:", data);

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: res.status }
        )

    } catch (error) {
        console.error("Erro interno ao tentar enviar notificação:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
