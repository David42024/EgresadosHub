import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key:    config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
     
    file: any,
    folder: string,
    publicId?: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:         folder,
          public_id:      publicId,
          transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
        },
        (error, result) => {
          if (error !== undefined || result === undefined) {
            reject(error);
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      ).end(file.buffer);
    });
  }

  async uploadFile(
     
    file: any,
    folder: string,
    publicId: string,
    isDocument: boolean = false,
  ): Promise<{ url: string; publicId: string }> {
    if (isDocument) {
      // Guardar localmente en el backend
      const uploadDir = path.join(process.cwd(), 'public', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${publicId}.pdf`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      
      // Usar URL pública para que el navegador pueda acceder al archivo
      const baseUrl = this.config.get<string>('API_PUBLIC_URL') || 
                      this.config.get<string>('API_INTERNAL_URL') || 
                      'http://localhost:3001';
      return { url: `${baseUrl}/${folder}/${filename}`, publicId };
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:         folder,
          public_id:      publicId,
          resource_type:  'image',
          overwrite:      true,
        },
        (error, result) => {
          if (error !== undefined || result === undefined) {
            reject(error);
            return;
          }
          
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      ).end(file.buffer);
    });
  }

  async uploadFromUrl(
    imageUrl: string,
    folder: string,
    publicId: string,
  ): Promise<{ url: string; publicId: string }> {
    try {
      if (!imageUrl.startsWith('http')) {
        throw new BadRequestException('URL inválida');
      }

      const result = await cloudinary.uploader.upload(imageUrl, {
        folder,
        public_id:      publicId,
        transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
      });

      return { url: result.secure_url, publicId: result.public_id };
    } catch {
      throw new BadRequestException('No se pudo procesar la URL de la imagen');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}