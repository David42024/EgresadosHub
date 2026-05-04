import {
  Controller, Post, UseInterceptors,
  UploadedFile, UseGuards, Req, Body, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  async uploadLogo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
    @Body('imageUrl') imageUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any
  ) {
    const user = req.user;
    
    if (file) {
      return this.uploadService.uploadImage(file, 'v1777703567', `logo_${user.userId}`);
    }

    if (imageUrl) {
      return this.uploadService.uploadFromUrl(imageUrl, 'v1777703567', `logo_${user.userId}`);
    }

    throw new BadRequestException('Debes enviar un archivo o una URL');
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  async uploadAvatar(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
    @Body('imageUrl') imageUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any
  ) {
    const user = req.user;

    if (file) {
      return this.uploadService.uploadImage(file, 'v1777703567', user.userId);
    }

    if (imageUrl) {
      return this.uploadService.uploadFromUrl(imageUrl, 'v1777703567', user.userId);
    }

    throw new BadRequestException('Debes enviar un archivo o una URL');
  }

  @Post('cv')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB para CV
    fileFilter: (_, file, cb) => {
      cb(null, file.mimetype === 'application/pdf');
    },
  }))
  async uploadCV(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
    @Body('imageUrl') imageUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any
  ) {
    const user = req.user;

    if (file) {
      return this.uploadService.uploadFile(file, 'v1777703567/curriculums', user.userId, true);
    }

    if (imageUrl) {
      return this.uploadService.uploadFromUrl(imageUrl, 'v1777703567/curriculums', user.userId);
    }

    throw new BadRequestException('Debes enviar un archivo PDF o una URL');
  }
}