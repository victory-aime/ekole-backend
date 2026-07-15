import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CLOUDINARY_FOLDER_NAME } from '../../config/enum';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  constructor(private readonly cloudinary: CloudinaryService) {}

  /**
   * Génère un nom unique basé sur :
   * nom original nettoyé
   * timestamp
   * petit suffixe aléatoire
   */
  private generateUniqueFilename(originalName: string): string {
    const ext = originalName.split('.').pop()?.toLowerCase();

    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    const sanitized = nameWithoutExt
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase();

    return `${sanitized}-${randomUUID()}.${ext}`;
  }

  private getResourceType(mimetype: string): 'image' | 'raw' {
    if (mimetype.startsWith('image/')) {
      return 'image';
    }
    return 'raw';
  }

  private sanitizeName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  async uploadFile(params: { file: Express.Multer.File; folderName: string }) {
    const { file, folderName } = params;

    if (!file?.originalname) {
      throw new BadRequestException('Fichier invalide');
    }

    const filename = this.generateUniqueFilename(file.originalname);
    const resourceType = this.getResourceType(file.mimetype);
    const folderPath = `${CLOUDINARY_FOLDER_NAME}/${folderName}`;

    return this.cloudinary.uploadFile(
      file.buffer,
      filename,
      folderPath,
      resourceType,
    );
  }

  async deleteUserImage(userId: string): Promise<void> {
    const folderPath = `${CLOUDINARY_FOLDER_NAME}/${userId}`;
    await this.cloudinary.deleteFolder(folderPath);
  }
}
