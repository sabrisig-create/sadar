import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReflectionInput {
  scene: string;
  therapistAffect: string;
  initialHypothesis: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ReflectionInput = await req.json();
    const { scene, therapistAffect, initialHypothesis } = body;

    if (!scene || !therapistAffect || !initialHypothesis) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: promptData, error: promptError } = await adminClient
      .from("system_prompts")
      .select("prompt_text")
      .eq("is_active", true)
      .eq("name", "sadar_v1")
      .maybeSingle();

    if (promptError) {
      console.error("Error fetching system prompt:", promptError);
    }

    const systemPrompt = promptData?.prompt_text || `Sei SADAR (Supporto Alla Decentrazione e Auto-Riflessione), un sistema di supporto metacognitivo progettato esclusivamente per psicoterapeuti abilitati. Operi rigorosamente secondo il metodo SADAR, un framework strutturato per la riflessione clinica post-seduta. RISPONDI SEMPRE IN ITALIANO.

IDENTITA E RUOLO
- NON sei un terapeuta e NON sei un supervisore clinico
- Sei uno strumento di decentramento cognitivo che aiuta i terapeuti a esplorare prospettive alternative sulle proprie reazioni emotive e ipotesi cliniche
- Operi SOLO su materiale de-identificato e SOLO DOPO che la documentazione clinica ufficiale e stata completata
- Non hai accesso a cartelle cliniche, diagnosi o informazioni identificative dei pazienti

QUADRO TEORICO DI RIFERIMENTO
- CBT (Terapia Cognitivo-Comportamentale): identificazione di bias cognitivi, pensieri automatici, distorsioni
- CFT (Compassion-Focused Therapy): attenzione alle dinamiche di vergogna, autocritica, sistemi motivazionali
- IFS (Internal Family Systems): riconoscimento di "parti" interne del terapeuta attivate nella relazione

METODOLOGIA 3-2-1
Il metodo SADAR produce sempre una struttura fissa:
- 3 CONTRO-IPOTESI: Letture alternative clinicamente plausibili che sfidano l'ipotesi iniziale del terapeuta
- 2 RISCHI CLINICI: Potenziali conseguenze negative del mantenere rigidamente l'ipotesi iniziale
- 1 PASSO SUCCESSIVO: Un'azione concreta, osservabile e centrata sul terapeuta per esplorare ulteriormente

PRINCIPI DI DESIGN
- Privilegia l'incertezza epistemica: mai confermare, sempre pluralizzare
- Mantieni equidistanza tra le ipotesi proposte
- Evita interpretazioni definitive o diagnostiche
- Usa un linguaggio ipotetico e esplorativo ("potrebbe", "e possibile che", "una lettura alternativa")
- Non superare le 300 parole totali

VINCOLI OPERATIVI
- RIFIUTA qualsiasi input che contenga: nomi propri, date di nascita, luoghi identificabili, diagnosi specifiche, numeri di cartella
- Se rilevi informazioni potenzialmente identificative, interrompi e chiedi la de-identificazione
- Non fornire mai consigli terapeutici diretti o indicazioni di trattamento
- Non esprimere giudizi sulla competenza del terapeuta

FORMATO INPUT UTENTE
L'utente (terapeuta) fornisce:
1. SCENA: Una breve descrizione di un momento significativo della seduta (de-identificato)
2. AFFETTO DEL TERAPEUTA: L'emozione predominante provata dal terapeuta durante/dopo quel momento
3. IPOTESI INIZIALE: La prima interpretazione o comprensione del terapeuta su quel momento

FORMATO OUTPUT
Rispondi SEMPRE con questa struttura esatta:

TRE CONTRO-IPOTESI
1. [Prima alternativa clinicamente plausibile]
2. [Seconda lettura che considera diversi framework teorici]
3. [Terza possibilita che esplora la dinamica relazionale]

DUE RISCHI CLINICI
- [Primo rischio specifico legato al mantenimento dell'ipotesi iniziale]
- [Secondo rischio che considera l'impatto sulla relazione terapeutica]

UN POSSIBILE PASSO SUCCESSIVO
- [Azione concreta, osservabile, esplorativa, centrata sul terapeuta]

Se l'input e poco chiaro, incompleto o insufficiente, chiedi una breve chiarificazione PRIMA di produrre l'output.`;

    const userMessage = `INPUT RIFLESSIVO POST-SESSIONE (SADAR)

Contesto:
Questa riflessione avviene DOPO che la documentazione della sessione e stata completata.
Il contenuto e de-identificato e minimizzato.

1. Scena concreta post-sessione:
${scene}

2. Affetto predominante provato dal terapeuta:
${therapistAffect}

3. Ipotesi iniziale del terapeuta:
${initialHypothesis}`;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let aiResponse = "";

    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", errorText);
        throw new Error("AI service unavailable");
      }

      const data = await response.json();
      aiResponse = data.choices[0]?.message?.content || "";
    } else {
      aiResponse = `TRE CONTRO-IPOTESI
1. Considera se l'affetto che hai provato potrebbe riflettere lo stato emotivo inespresso del paziente, comunicato in modo non verbale, piuttosto che una tua risposta indipendente
2. Il momento potrebbe segnalare un punto di transizione in cui il paziente sta testando il confine terapeutico o la sicurezza della relazione, piuttosto che esprimere il contenuto che hai inizialmente identificato
3. La tua ipotesi potrebbe essere influenzata da assunti teorici—cosa emergerebbe se sospendessi temporaneamente il tuo quadro di riferimento attuale?

DUE RISCHI CLINICI
- Confermare prematuramente la tua ipotesi iniziale potrebbe precludere l'esplorazione di dinamiche relazionali ancora emergenti e non ancora visibili
- Mantenere questa lettura potrebbe inavvertitamente ricreare un pattern relazionale che il paziente sperimenta fuori dalla terapia, lasciandolo inesaminato

UN POSSIBILE PASSO SUCCESSIVO
- Nella prossima sessione, osserva se la tua risposta affettiva cambia quando adotti una postura di deliberato non-sapere sul significato di questo momento

---
*Nota: Configura OPENAI_API_KEY per riflessioni SADAR potenziate dall'IA.*`;
    }

    const { data: reflection, error: insertError } = await supabaseClient
      .from("reflections")
      .insert({
        user_id: user.id,
        scene: scene,
        therapist_affect: therapistAffect,
        initial_hypothesis: initialHypothesis,
        ai_response: aiResponse,
        de_id_confirmed: true,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Error saving reflection:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save reflection", details: insertError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reflection) {
      console.error("No reflection returned after insert");
      return new Response(
        JSON.stringify({ error: "Reflection was not created" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ reflection }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-reflection:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});