import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.enum';

@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  // 🔓 Public access for students
  @Get()
  getResources() {
    return this.resourcesService.getAllResources();
  }

  // 🔐 Admin only
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  createResource(@Req() req, @Body() body) {
    return this.resourcesService.createResource(
      body.title,
      body.category,
      body.content_url,
      req.user.sub,
    );
  }
}