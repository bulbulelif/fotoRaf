import { FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await req.file();
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    // Dosya tipini kontrol et
    if (!data.mimetype.startsWith('image/')) {
      return reply.code(400).send({ error: 'Only image files are allowed' });
    }

    // uploads dizinini oluştur
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = data.filename.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filepath = join(uploadsDir, filename);

    // Dosyayı kaydet
    await pipeline(data.file, createWriteStream(filepath));

    // URL'i döndür
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    return reply.send({
      success: true,
      url: fileUrl,
      filename: filename
    });
  } catch (err: any) {
    req.log.error({ err }, 'Upload error');
    return reply.code(500).send({ error: 'Upload failed', detail: err.message });
  }
}

