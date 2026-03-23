import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PollRecord {
  id: string
  title: string
  option_a: string
  option_b: string
  category: string
  author_username?: string
}

interface ModerationResult {
  verdict: 'safe' | 'flagged'
  reason: string
  confidence: number
  model: string
  timestamp: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json() as { record: PollRecord }

    if (!record?.id) {
      return new Response(JSON.stringify({ error: 'No poll record provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const prompt = `You are a content moderator for a binary polling app. Review this poll for policy violations.

Poll title: "${record.title}"
Option A: "${record.option_a}"
Option B: "${record.option_b}"
Category: ${record.category}

Check for:
- Hate speech or discrimination targeting groups
- Explicit sexual content
- Illegal activities (drugs, violence, threats)
- Political incitement or dangerous misinformation
- Personal harassment (targeting real individuals negatively)
- Spam or low-effort content

Respond with ONLY valid JSON, no other text:
{
  "verdict": "safe" or "flagged",
  "reason": "brief explanation (max 100 chars)",
  "confidence": 0-100
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = (message.content[0] as { type: string; text: string }).text.trim()
    let parsed: { verdict: string; reason: string; confidence: number }

    try {
      parsed = JSON.parse(responseText)
    } catch {
      // If JSON parsing fails, default to pending (manual review)
      parsed = { verdict: 'flagged', reason: 'Could not parse moderation response', confidence: 0 }
    }

    const result: ModerationResult = {
      verdict: parsed.verdict === 'safe' ? 'safe' : 'flagged',
      reason: parsed.reason || '',
      confidence: Number(parsed.confidence) || 0,
      model: 'claude-haiku-4-5-20251001',
      timestamp: new Date().toISOString(),
    }

    // Auto-approve if safe with high confidence, else leave pending for admin review
    const newStatus = result.verdict === 'safe' && result.confidence >= 80
      ? 'approved'
      : 'pending'

    // Update poll in DB
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/polls?id=eq.${record.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        validation_status: newStatus,
        moderation_result: result,
      }),
    })

    if (!updateRes.ok) {
      const errText = await updateRes.text()
      console.error('[moderate-poll] Failed to update poll:', errText)
    }

    return new Response(
      JSON.stringify({ pollId: record.id, status: newStatus, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[moderate-poll] Error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
