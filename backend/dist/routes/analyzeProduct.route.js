import { analyzeProductController } from '../controllers/analyzeProduct.controller.js';
export async function registerAnalyzeProductRoute(app) {
    app.post('/v1/analyze-product', analyzeProductController);
}
