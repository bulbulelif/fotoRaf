import { generateDescriptionController } from '../controllers/generateDescription.controller.js';
export async function registerDescriptionRoute(app) {
    app.post('/v1/descriptions/generate', generateDescriptionController);
}
