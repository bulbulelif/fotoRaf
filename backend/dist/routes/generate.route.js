import { generateController } from '../controllers/generate.controller.js';
export async function registerGenerateRoute(app) {
    app.post('/v1/generate', generateController);
}
