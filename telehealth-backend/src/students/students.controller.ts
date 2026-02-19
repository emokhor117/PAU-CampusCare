import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Role } from '../common/utils/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';

@Controller('student')
export class StudentsController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Get('dashboard')
  getDashboard(@Req() req) {
    const anonProfile = this.usersService.generateAnonymousProfile(
      req.user.sub,
    );

    return {
      message: 'Student dashboard',
      anonymous_profile: anonProfile,
    };
  }
}
