import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { SubmitLoginModule } from '../submit-login/submit-login.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [forwardRef(() => UsersModule), JwtModule.register({}), SubmitLoginModule],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
