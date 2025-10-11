import { FastifyInstance } from 'fastify';
import { generateController } from '../controllers/generate.controller.js';

export async function registerGenerateRoute(app: FastifyInstance) {
  app.post('/v1/generate', generateController);
}
