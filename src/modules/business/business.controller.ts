import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get('hours')
  getHours() {
    return this.businessService.getHours();
  }

  @Put('hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BARBERO')
  updateHours(@Body() body: { dias: any[] }) {
    return this.businessService.updateHours(body.dias);
  }
}
