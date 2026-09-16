'use server';

import { IMAGE_TYPES, MAX_IMAGE_BYTES, validImageSignature } from '@/lib/upload-validation';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminSession } from '@/lib/auth';

export type UploadResult = { success: boolean; url?: string; error?: string };

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary no está configurado en el servidor.');
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function uploadProductImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdminSession();
  const image = formData.get('image');
  if (!(image instanceof File) || image.size === 0) {
    return { success: false, error: 'Selecciona una imagen para subir.' };
  }
  if (!IMAGE_TYPES.includes(image.type)) {
    return { success: false, error: 'El archivo debe ser una imagen.' };
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return { success: false, error: 'La imagen no puede superar 4 MB.' };
  }

  try {
    configureCloudinary();
    const buffer = Buffer.from(await image.arrayBuffer());
    if (!validImageSignature(buffer, image.type)) return { success: false, error: 'El contenido del archivo no corresponde a una imagen admitida.' };
    const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'aquapora/products',
          resource_type: 'image',
          format: 'webp',
          transformation: [{ quality: 'auto:best', fetch_format: 'webp' }],
        },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult ?? {}))
      );
      upload.end(buffer);
    });

    if (!result.secure_url) throw new Error('Cloudinary no devolvió una URL segura.');
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('No se pudo subir la imagen a Cloudinary:', error);
    return { success: false, error: 'No se pudo subir la imagen. Verifica Cloudinary e inténtalo de nuevo.' };
  }
}
