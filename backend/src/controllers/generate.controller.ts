import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

const schema = z.object({
  inputImageUrl: z.string().url(),
  prompt: z.string().optional(),
  removeBg: z.boolean().default(true),
  categories: z.object({
    main_product_type: z.string(),
    subcategory: z.string(),
    target_audience: z.string(),
    price_range: z.string(),
    use_case: z.string(),
    style_design: z.string(),
    season_occasion: z.string(),
    industrial_type: z.string(),
    vibe: z.string()
  }).optional()
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
  const { inputImageUrl, prompt, removeBg, categories } = schema.parse(req.body);

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
    } else if (categories) {
      // Kategoriler varsa, Python'daki generate_background_prompt fonksiyonunu kullan
      req.log.info({ categories }, 'Generating prompt from categories');
      
      const { stdout: promptOutput } = await exec('python3', [
        'src/services/fal_worker.py',
        'generate-bg-prompt',
        '--categories', JSON.stringify(categories),
        '--style_type', 'Professional e-commerce product photography with premium aesthetic'
      ], {
        timeout: 30000,
        cwd: process.cwd()
      });

      const promptData = JSON.parse(promptOutput);
      
      if (promptData.error) {
        req.log.warn({ err: promptData.error }, 'Category-based prompt generation failed, using default');
        finalPrompt = DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)];
      } else {
        finalPrompt = promptData.prompt;
        req.log.info({ generatedPrompt: finalPrompt }, 'Prompt generated from categories');
      }
    } else {
      // Ne prompt ne de kategoriler yoksa, default'lardan rastgele seç
      finalPrompt = DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)];
      req.log.info({ defaultPrompt: finalPrompt }, 'Using default background');
    }

    // Eğer localhost URL'si ise, önce FAL'a yükle
    let falImageUrl = inputImageUrl;
    if (inputImageUrl.includes('localhost') || inputImageUrl.includes('127.0.0.1')) {
      req.log.info({ originalUrl: inputImageUrl }, 'Localhost URL detected, uploading to FAL');
      
      // Local dosya yolunu al
      const urlPath = new URL(inputImageUrl).pathname;
      const localPath = `${process.cwd()}${urlPath}`;
      
      // FAL'a yükle
      const { stdout: uploadOutput } = await exec('python3', [
        '-c',
        `import fal_client; print(fal_client.upload_file('${localPath}'))`
      ], {
        timeout: 30000,
        cwd: process.cwd(),
        env: { ...process.env }
      });
      
      falImageUrl = uploadOutput.trim();
      req.log.info({ falImageUrl }, 'Image uploaded to FAL');
    }

    // Background replacement çağır
    const { stdout } = await exec('python3', [
      'src/services/fal_worker.py',
      'background',
      '--image_url', falImageUrl,
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
