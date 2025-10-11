import { FastifyInstance } from 'fastify';
import { analyzeProductController } from '../controllers/analyzeProduct.controller.js';

export async function registerAnalyzeProductRoute(app: FastifyInstance) {
  app.post('/v1/analyze-product', analyzeProductController);
}

