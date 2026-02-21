import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async changePassword(user_id: number, newHash: string) {
  return this.usersService.updatePassword(user_id, newHash);
}

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);

    let anonProfile = user.anonymousProfile;
    
    if (user.role === 'STUDENT') {
      anonProfile = await this.usersService.generateAnonymousProfile(
        user.user_id,
      );
    }
    await this.prisma.logAction(user.user_id, 'User logged in');


    const payload = {
      sub: user.user_id,
      role: user.role,
      anon_id: anonProfile?.anon_id || null,
      first_login: user.first_login,
    };

    return {
      access_token: this.jwtService.sign(payload),
      first_login: user.first_login,
      role: user.role,
    };


  }
}
