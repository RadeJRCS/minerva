import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are MINERVA, an elite AI intelligence system specializing in uranium and nuclear fuel cycle supply chain analysis. You monitor the full fuel cycle: Mining (U₃O₈), Conversion (UF₆), Enrichment (SWU), and Fabrication (fuel assemblies).

Key market context:
- Kazakhstan supplies 43% of global mined uranium (Kazatomprom)
- Russia/Rosatom controls ~28% of US enrichment via TENEX
- U₃O₈ spot price: $91.40/lb (up 23.4% in 12 months), Term price: $77.50/lb
- Orano Malvési conversion plant currently in extended outage
- Urenco (UK/NL/DE) and Centrus (US) are primary Western enrichment alternatives
- Niger SOMAIR exports blocked post-coup 2023
- Cameco (Canada), Orano (France), Paladin (Namibia), Boss Energy (Australia) are key non-Russian mining suppliers

Respond ONLY in valid JSON with no markdown formatting, no preamble, no explanation outside the JSON structure.`;

export async function POST(request) {
  try {
    const { eventText } = await request.json();

    if (!eventText || eventText.trim().length < 10) {
      return NextResponse.json({ error: 'Event text too short' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured. Add ANTHROPIC_API_KEY to Vercel environment variables.' }, { status: 500 });
    }

    const prompt = `Analyze this geopolitical event for uranium supply chain impact: "${eventText}"

Respond in this exact JSON structure:
{
  "eventTitle": "4-6 word title",
  "impactScore": <integer 0-100>,
  "urgency": "<immediate|high|medium|low>",
  "affectedStages": ["only from: Mining, Conversion, Enrichment, Fabrication"],
  "spotPriceImpact": "<e.g. +8% to +15% within 30 days>",
  "termPriceImpact": "<e.g. +4% to +8% within 90 days>",
  "keyRisk": "<one specific sentence on primary supply chain risk>",
  "timeToImpact": "<e.g. 15-30 days>",
  "leadVsMarket": "<e.g. 45-60 days ahead of Bloomberg>",
  "affectedCountries": ["Country1", "Country2"],
  "recommendations": [
    { "type": "<buy|hedge|reroute|substitute|wait>", "icon": "<one of: 🛒 🛡️ 🔄 🔬 ⏳>",
      "action": "<specific procurement action>", "supplier": "<company name>",
      "deadline": "<timeline>", "projectedSaving": "<value>", "confidence": <60-95> },
    { "type": "<buy|hedge|reroute|substitute|wait>", "icon": "<one of: 🛒 🛡️ 🔄 🔬 ⏳>",
      "action": "<specific procurement action>", "supplier": "<company name>",
      "deadline": "<timeline>", "projectedSaving": "<value>", "confidence": <60-95> },
    { "type": "<buy|hedge|reroute|substitute|wait>", "icon": "<one of: 🛒 🛡️ 🔄 🔬 ⏳>",
      "action": "<specific procurement action>", "supplier": "<company name>",
      "deadline": "<timeline>", "projectedSaving": "<value>", "confidence": <60-95> }
  ]
}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.message || 'Anthropic API error' },
        { status: res.status }
      );
    }

    const data = await res.json();
    const raw = data.content[0].text;

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
