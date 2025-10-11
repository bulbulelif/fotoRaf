import { FastifyInstance } from 'fastify';
import { generateDescriptionController } from '../controllers/generateDescription.controller.js';

export async function registerDescriptionRoute(app: FastifyInstance) {
  app.post('/v1/descriptions/generate', generateDescriptionController);
}

