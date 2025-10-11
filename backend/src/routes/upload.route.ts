import { FastifyInstance } from 'fastify';
import { uploadController } from '../controllers/upload.controller.js';

export async function registerUploadRoute(app: FastifyInstance) {
  app.post('/v1/upload', uploadController);
}

