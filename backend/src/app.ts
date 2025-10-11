import Fastify from 'fastify';
import { registerGenerateRoute } from './routes/generate.route.js';
import { registerDescriptionRoute } from './routes/description.route.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerGenerateRoute(app);
  await registerDescriptionRoute(app);
  return app;
}
