import { marketingKitController } from '../controllers/marketingKit.controller.js';
export async function registerMarketingRoute(app) {
    app.post('/v1/marketing/kit', marketingKitController);
}
