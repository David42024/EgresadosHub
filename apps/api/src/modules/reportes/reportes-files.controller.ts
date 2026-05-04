import { Controller, Get, Param, NotFoundException, StreamableFile, Header } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller('storage/pdfs')
export class ReportesFilesController {
  @Get(':filename')
  @Header('Content-Type', 'application/pdf')
  getFile(@Param('filename') filename: string): StreamableFile {
    // Validar que el filename no tenga path traversal
    if (filename.includes('..') || filename.includes('/')) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const path = join(process.cwd(), 'storage', 'pdfs', filename);
    
    if (!existsSync(path)) {
      throw new NotFoundException(`Archivo ${filename} no encontrado`);
    }

    const file = createReadStream(path);
    return new StreamableFile(file, {
      disposition: `inline; filename="${filename}"`,
    });
  }
}
