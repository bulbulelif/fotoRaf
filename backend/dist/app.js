import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { registerGenerateRoute } from './routes/generate.route.js';
import { registerDescriptionRoute } from './routes/description.route.js';
import { registerMarketingRoute } from './routes/marketing.route.js';
import { registerUploadRoute } from './routes/upload.route.js';
import { registerAnalyzeProductRoute } from './routes/analyzeProduct.route.js';
export async function buildApp() {
    const app = Fastify({ logger: true });
    // CORS desteği ekle
    await app.register(cors, {
        origin: true, // Tüm originlere izin ver (geliştirme için)
        credentials: true
    });
    // Multipart/form-data desteği
    await app.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        }
    });
    // Static dosyalar için (upload edilen görseller)
    await app.register(fastifyStatic, {
        root: join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
    });
    await registerGenerateRoute(app);
    await registerDescriptionRoute(app);
    await registerMarketingRoute(app);
    await registerUploadRoute(app);
    await registerAnalyzeProductRoute(app);
    return app;
}
