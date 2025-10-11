import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

  const schema = z.object({
  title: z.string().min(1),
  features: z.array(z.string()).optional(),
  industry: z.string().optional(),
  tone: z.enum(['concise', 'detailed']).default('concise'),
  language: z.enum(['tr', 'en']).default('tr'),
  maxTokens: z.number().int().min(80).max(400).default(300),
  temperature: z.number().min(0).max(1).default(0.7)
});

export async function marketingKitController(req: FastifyRequest, reply: FastifyReply) {
  try {
    var { title, features, industry, tone, language, maxTokens, temperature } = schema.parse(req.body);
  } catch (validationErr: any) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: validationErr.message || 'Validation error'
    });
  }

  const systemPromptTR = `Kıdemli bir e-ticaret metin yazarısın.
Gerçekçi, iddiasız ve SEO-dostu yaz. Marka adı, medikal iddia ve sertifikasyon iddiası kullanma.
Özellik->fayda dengesini koru, alışverişe güven veren sakin bir üslup kullan.`;

  const systemPromptEN = `You are a senior e-commerce copywriter.
Write realistic, claim-free, SEO-friendly copy. Avoid brand names, medical claims, and certification claims.
Balance features with benefits; keep a calm, trustworthy tone.`;

  const sys = language === 'tr' ? systemPromptTR : systemPromptEN;

  // Build user prompt for marketing kit generation
  const userLines = [
    language === 'tr' ? `Ürün başlığı: ${title}` : `Product title: ${title}`,
    industry ? (language === 'tr' ? `Sektör: ${industry}` : `Industry: ${industry}`) : '',
    features?.length ? (language === 'tr'
      ? `Özellikler: ${features.join(', ')}`
      : `Features: ${features.join(', ')}`) : '',
    '',
    language === 'tr' 
      ? `Bir pazarlama kiti oluştur. Yanıtını SADECE aşağıdaki JSON formatında ver (başka metin ekleme):

{
  "tagline": "tek cümle slogan buraya",
  "bullets": ["özellik ve faydası 1", "özellik ve faydası 2", "özellik ve faydası 3"],
  "hashtags": ["#etiket1", "#etiket2", "#etiket3", "#etiket4", "#etiket5", "#etiket6"],
  "captions": {
    "ig": "Instagram caption buraya",
    "tt": "TikTok caption buraya"
  },
  "altText": "nesnel görsel açıklaması"
}

Kurallar:
- tagline: 1 cümle, vurucu
- bullets: 3-5 madde, her biri özellik→fayda
- hashtags: 6-10 etiket, # ile başla
- captions.ig: ${tone === 'concise' ? '2-3 cümle' : '4-5 cümle'}
- captions.tt: ${tone === 'concise' ? '1-2 cümle enerjik' : '2-3 cümle enerjik'}
- altText: 1-2 cümle nesnel betimleme

SADECE JSON ver, başka açıklama ekleme.`
      : `Generate a marketing kit. Respond with ONLY the following JSON format (no additional text):

{
  "tagline": "one sentence tagline here",
  "bullets": ["feature and benefit 1", "feature and benefit 2", "feature and benefit 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
  "captions": {
    "ig": "Instagram caption here",
    "tt": "TikTok caption here"
  },
  "altText": "objective image description"
}

Rules:
- tagline: 1 sentence, compelling
- bullets: 3-5 items, each feature→benefit
- hashtags: 6-10 tags, start with #
- captions.ig: ${tone === 'concise' ? '2-3 sentences' : '4-5 sentences'}
- captions.tt: ${tone === 'concise' ? '1-2 energetic sentences' : '2-3 energetic sentences'}
- altText: 1-2 sentences, objective description

Output ONLY valid JSON, no explanations.`
  ].filter(Boolean).join('\n');

  try {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const startTime = Date.now();

    const { stdout } = await exec('python3', [
      'src/services/fal_worker.py',
      'any-llm-complete',
      '--prompt', userLines,
      '--system', sys,
      '--model', model,
      '--temperature', String(temperature),
      '--max_tokens', String(maxTokens),
      '--priority', 'latency'
    ], { 
      timeout: 120000,
      cwd: process.cwd()
    });

    const duration = Date.now() - startTime;
    const data = JSON.parse(stdout);

    if (data.error) {
      req.log.error({ err: data.error, model, language, tone, duration }, 'marketing kit llm failed');
      return reply.code(502).send({ error: 'llm_failed', detail: data.error });
    }

    // Parse LLM output to extract JSON
    let kitData: any;
    const outputText = data.output ?? data.raw?.output ?? '';

    try {
      // Try to extract JSON from the output
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        kitData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in LLM output');
      }
    } catch (parseErr: any) {
      req.log.error({ err: parseErr, output: outputText.substring(0, 200) }, 'failed to parse marketing kit JSON');
      return reply.code(502).send({ 
        error: 'llm_failed', 
        detail: 'LLM output was not valid JSON format' 
      });
    }

    // Validate kit structure
    if (!kitData.tagline || !Array.isArray(kitData.bullets) || kitData.bullets.length < 3 ||
        !Array.isArray(kitData.hashtags) || kitData.hashtags.length < 6 ||
        !kitData.captions?.ig || !kitData.captions?.tt || !kitData.altText) {
      req.log.error({ kitData }, 'marketing kit missing required fields');
      return reply.code(502).send({ 
        error: 'llm_failed', 
        detail: 'Generated kit missing required fields or minimum counts' 
      });
    }

    req.log.info({ model, language, tone, duration, title: title.substring(0, 50) }, 'marketing kit generated');

    return reply.send({
      language,
      tone,
      model,
      kit: {
        tagline: kitData.tagline,
        bullets: kitData.bullets,
        hashtags: kitData.hashtags,
        captions: {
          ig: kitData.captions.ig,
          tt: kitData.captions.tt
        },
        altText: kitData.altText
      },
      meta: {
        maxTokens,
        temperature,
        reasoning: data.reasoning ?? null
      }
    });
  } catch (err: any) {
    req.log.error({ err, title: title.substring(0, 50) }, 'marketing kit exception');
    return reply.code(500).send({ error: 'internal_error' });
  }
}

