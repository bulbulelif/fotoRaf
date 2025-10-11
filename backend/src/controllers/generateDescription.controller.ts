import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

const schema = z.object({
  title: z.string().min(1),
  features: z.array(z.string()).optional(),   // ["ergonomik sap","bulaşık makinesinde yıkanabilir"]
  industry: z.string().optional(),            // "housewares","electronics", etc.
  tone: z.enum(['concise','detailed']).default('concise'),
  language: z.enum(['tr','en']).default('tr'),
  maxTokens: z.number().int().min(50).max(400).default(120),
  temperature: z.number().min(0).max(1).default(0.7)
});

export async function generateDescriptionController(req: FastifyRequest, reply: FastifyReply) {
  const { title, features, industry, tone, language, maxTokens, temperature } = schema.parse(req.body);

  const systemPromptTR = `Kıdemli bir e-ticaret metin yazarısın.
Kısa, dürüst ve SEO-dostu yaz. Aşırı iddia, marka adı ve yasa dışı ifadeler kullanma.
Özellik->fayda dengesini koru, alışverişe güven veren sakin bir üslup kullan.`;

  const systemPromptEN = `You are a senior e-commerce copywriter.
Write concise, honest, SEO-friendly copy. Avoid exaggerated claims and brand names.
Balance features with benefits; keep a calm, trustworthy tone.`;

  const sys = language === 'tr' ? systemPromptTR : systemPromptEN;

  const userLines = [
    language === 'tr' ? `Ürün başlığı: ${title}` : `Product title: ${title}`,
    industry ? (language === 'tr' ? `Sektör: ${industry}` : `Industry: ${industry}`) : '',
    features?.length ? (language === 'tr'
      ? `Özellikler: ${features.join(', ')}`
      : `Features: ${features.join(', ')}`) : '',
    (language === 'tr'
      ? `İstenen çıktı: ${tone === 'concise' ? '2-3 cümle kısa tanıtım' : '4-6 cümle detaylı tanıtım'}`
      : `Requested output: ${tone === 'concise' ? '2-3 sentence short description' : '4-6 sentence detailed description'}`)
  ].filter(Boolean).join('\n');

  try {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

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

    const data = JSON.parse(stdout);

    if (data.error) {
      req.log.error({ err: data.error }, 'llm failed');
      return reply.code(502).send({ error: 'llm_failed', detail: data.error });
    }

    return reply.send({
      model,
      language,
      tone,
      description: data.output ?? data.raw?.output ?? '',
      meta: {
        maxTokens,
        temperature,
        reasoning: data.reasoning ?? null
      }
    });
  } catch (err: any) {
    req.log.error({ err }, 'description exception');
    return reply.code(500).send({ error: 'internal_error' });
  }
}

