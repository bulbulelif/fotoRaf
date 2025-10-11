import { uploadController } from '../controllers/upload.controller.js';
export async function registerUploadRoute(app) {
    app.post('/v1/upload', uploadController);
}
