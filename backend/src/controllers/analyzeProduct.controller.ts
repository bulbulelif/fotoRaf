import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);

const schema = z.object({
  imageUrl: z.string().url(),
  model: z.string().optional().default('google/gemini-2.5-flash'),
  temperature: z.number().min(0).max(1).optional().default(0.3)
});

export async function analyzeProductController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { imageUrl, model, temperature } = schema.parse(req.body);

    req.log.info({ imageUrl, model }, 'Analyzing product image');

    // Eğer localhost URL'si ise, önce FAL'a yükle
    let falImageUrl = imageUrl;
    if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
      req.log.info({ originalUrl: imageUrl }, 'Localhost URL detected, uploading to FAL');
      
      const urlPath = new URL(imageUrl).pathname;
      const localPath = `${process.cwd()}${urlPath}`;
      
      const { stdout: uploadOutput } = await exec('python3', [
        'src/services/fal_worker.py',
        'upload-file',
        '--file_path', localPath
      ], {
        timeout: 30000,
        cwd: process.cwd(),
        env: { ...process.env }
      });
      
      const uploadResult = JSON.parse(uploadOutput);
      if (uploadResult.error) {
        req.log.error({ err: uploadResult.error }, 'FAL upload failed');
        return reply.code(502).send({ error: 'upload_failed', detail: uploadResult.error });
      }
      
      falImageUrl = uploadResult.url;
      req.log.info({ falImageUrl }, 'Image uploaded to FAL');
    }

    // Python worker'ı çağır
    const { stdout } = await exec('python3', [
      'src/services/fal_worker.py',
      'analyze-product',
      '--image_url', falImageUrl,
      '--model', model,
      '--temperature', String(temperature)
    ], { 
      timeout: 60000,
      cwd: process.cwd()
    });

    const data = JSON.parse(stdout);

    if (data.error) {
      req.log.error({ err: data.error }, 'Product analysis failed');
      return reply.code(502).send({ error: 'analysis_failed', detail: data.error });
    }

    // Kategorileri döndür
    return reply.send(data.categories);
  } catch (err: any) {
    req.log.error({ err }, 'Product analysis exception');
    return reply.code(500).send({ error: 'internal_error' });
  }
}

