import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

const schema = z.object({
  inputImageUrl: z.string().url(),
  prompt: z.string().optional(),
  removeBg: z.boolean().default(true)
});

// Default background prompts (rastgele seçilecek)
const DEFAULT_BACKGROUNDS = [
  'soft key light, seamless white studio backdrop, premium e-commerce look, product centered, subtle shadow',
  'minimalist gray background, professional studio lighting, clean product photography',
  'warm beige studio background, soft diffused lighting, elegant product display',
  'modern white backdrop, high-key lighting, crisp shadows, commercial photography',
  'neutral cream background, natural light simulation, professional product shot'
];

export async function generateController(req: FastifyRequest, reply: FastifyReply) {
  const { inputImageUrl, prompt, removeBg } = schema.parse(req.body);

  try {
    let finalPrompt: string;

    if (prompt && prompt.trim()) {
      // Kullanıcı prompt yazdıysa, LLM ile refine et
      req.log.info({ originalPrompt: prompt }, 'Refining user prompt with LLM');
      
      const { stdout: llmOutput } = await exec('python3', [
        'src/services/fal_worker.py',
        'any-llm-complete',
        '--prompt', `Transform this background description into a professional photography prompt for product images: "${prompt}"
        
Output should be:
- Concise (max 20 words)
- Focus on lighting, backdrop, and photography style
- Professional e-commerce quality
- No camera settings or technical jargon

Just output the refined prompt, nothing else.`,
        '--system', 'You are a professional product photography expert. Create concise, effective prompts for AI image generation.',
        '--model', 'openai/gpt-4o-mini',
        '--temperature', '0.7',
        '--max_tokens', '100'
      ], {
        timeout: 30000,
        cwd: process.cwd()
      });

      const llmData = JSON.parse(llmOutput);
      
      if (llmData.error) {
        req.log.warn({ err: llmData.error }, 'LLM refinement failed, using original prompt');
        finalPrompt = prompt;
      } else {
        finalPrompt = llmData.output.trim();
        req.log.info({ refinedPrompt: finalPrompt }, 'Prompt refined successfully');
      }
    } else {
      // Prompt yoksa, default'lardan rastgele seç
      finalPrompt = DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)];
      req.log.info({ defaultPrompt: finalPrompt }, 'Using default background');
    }

    // Background replacement çağır
    const { stdout } = await exec('python3', [
      'src/services/fal_worker.py',
      'background',
      '--image_url', inputImageUrl,
      '--prompt', finalPrompt,
      '--remove_bg', String(removeBg)
    ], { 
      timeout: 120000,
      cwd: process.cwd()
    });

    const data = JSON.parse(stdout);

    if (data.error) {
      req.log.error({ err: data.error }, 'FAL python error');
      return reply.code(502).send({ error: 'generation_failed', detail: data.error });
    }

    // FAL nano-banana çıktı: { image: { url: "...", width: ..., height: ... }, timings: {...} }
    const url = data.image?.url;
    if (!url) return reply.code(502).send({ error: 'no_output' });

    return reply.send({
      preset: prompt ? 'custom' : 'studio-soft',
      resultUrl: url,
      width: data.image?.width,
      height: data.image?.height,
      usedPrompt: finalPrompt
    });
  } catch (err: any) {
    req.log.error({ err }, 'generation exception');
    return reply.code(500).send({ error: 'internal_error' });
  }
}
