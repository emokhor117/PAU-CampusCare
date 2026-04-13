import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Delete
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class CreateStudentDto {
  matric_number: string;
  email: string;
  password: string;
  department: string;
  level: string;
}

class CreateCounsellorDto {
  staff_number: string;
  email: string;
  password: string;
  department: string;
}

class SetStatusDto {
  status: 'ACTIVE' | 'SUSPENDED';
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/student
  @Post('student')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.usersService.createStudent(dto);
  }

  // POST /users/counsellor
  @Post('counsellor')
  createCounsellor(@Body() dto: CreateCounsellorDto) {
    return this.usersService.createCounsellor(dto);
  }

  // GET /users/students
  @Get('students')
  getAllStudents() {
    return this.usersService.findAllStudents();
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.deleteUser(id);
  }

  // GET /users/counsellors
  @Get('counsellors')
  getAllCounsellors() {
    return this.usersService.findAllCounsellors();
  }

  // PATCH /users/:id/status
  @Patch(':id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetStatusDto,
  ) {
    return this.usersService.setAccountStatus(id, dto.status);
  }
}