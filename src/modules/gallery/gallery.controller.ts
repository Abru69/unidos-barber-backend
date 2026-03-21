import {
  Controller, Get, Post, Delete, Param,
  UseGuards, UseInterceptors, UploadedFile,
  Request, Body, HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'unidos-barber', public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(buffer);
  });
}

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
    storage: memoryStorage(),
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
    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    const url = await uploadToCloudinary(file.buffer, filename);
    return this.prisma.galleryImage.create({
      data: { url, descripcion: descripcion || 'Sin descripción', uploadedBy: req.user.sub },
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const img = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (img?.url.includes('cloudinary')) {
      const publicId = img.url.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
