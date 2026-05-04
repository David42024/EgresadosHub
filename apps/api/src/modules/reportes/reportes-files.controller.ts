import { Controller, Get, Param, NotFoundException, StreamableFile, Header, Logger } from '@nestjs/common';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

@Controller('storage/pdfs')
export class ReportesFilesController {
  private readonly logger = new Logger(ReportesFilesController.name);

  @Get(':filename')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment')
  getFile(@Param('filename') filename: string): StreamableFile {
    this.logger.log(`Solicitando archivo: ${filename}`);
    this.logger.log(`CWD: ${process.cwd()}`);

    // Validar que el filename no tenga path traversal
    if (filename.includes('..') || filename.includes('/')) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const path = join(process.cwd(), 'storage', 'pdfs', filename);
    this.logger.log(`Ruta completa: ${path}`);

    if (!existsSync(path)) {
      this.logger.error(`Archivo no existe: ${path}`);
      throw new NotFoundException(`Archivo ${filename} no encontrado`);
    }

    const stats = statSync(path);
    this.logger.log(`Archivo encontrado, tamaño: ${stats.size} bytes`);

    const file = createReadStream(path);
    return new StreamableFile(file, {
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
