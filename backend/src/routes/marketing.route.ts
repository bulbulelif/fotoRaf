import { FastifyInstance } from 'fastify';
import { marketingKitController } from '../controllers/marketingKit.controller.js';

export async function registerMarketingRoute(app: FastifyInstance) {
  app.post('/v1/marketing/kit', marketingKitController);
}

