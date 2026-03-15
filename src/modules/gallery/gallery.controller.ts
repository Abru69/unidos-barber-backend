import {
  Controller, Get, Post, Delete, Param,
  UseGuards, UseInterceptors, UploadedFile,
  Request, Body, HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('gallery')
export class GalleryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.galleryImage.findMany({
      where:   { visible: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('descripcion') descripcion: string,
  ) {
    const url = `${process.env.API_URL}/uploads/${file.filename}`;
    return this.prisma.galleryImage.create({
      data: { url, descripcion, uploadedBy: req.user.sub },
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
