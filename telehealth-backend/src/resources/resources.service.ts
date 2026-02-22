import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async createResource(
    title: string,
    category: string,
    content_url: string,
    admin_id: number,
  ) {
    return this.prisma.resource.create({
      data: {
        title,
        category,
        content_url,
        created_by: admin_id,
      },
    });
  }

  async getAllResources() {
    return this.prisma.resource.findMany({
      orderBy: { created_at: 'desc' },
    });
  }
}