import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';

// Función helper para manejar errores de Multer en controladores
export function handleMulterError(error: any): never {
  if (error instanceof MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        throw new HttpException(
          {
            success: false,
            message: 'El archivo es demasiado grande. Máximo 5MB permitido.',
            error: 'FILE_TOO_LARGE',
          },
          HttpStatus.BAD_REQUEST,
        );
      case 'LIMIT_FILE_COUNT':
        throw new HttpException(
          {
            success: false,
            message: 'Demasiados archivos. Solo se permite 1 archivo.',
            error: 'TOO_MANY_FILES',
          },
          HttpStatus.BAD_REQUEST,
        );
      case 'LIMIT_UNEXPECTED_FILE':
        throw new HttpException(
          {
            success: false,
            message: 'Campo de archivo inesperado.',
            error: 'UNEXPECTED_FILE_FIELD',
          },
          HttpStatus.BAD_REQUEST,
        );
      default:
        throw new HttpException(
          {
            success: false,
            message: 'Error al procesar el archivo.',
            error: 'FILE_PROCESSING_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  throw error;
}
