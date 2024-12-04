// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ResetPassDto } from './dto/resetpass.dto';
import { ChangePasswordDto } from './dto/changepass.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
  ) {}

  // Constants for token expiry times
  private readonly TOKEN_EXPIRY = {
    VERIFICATION: '30m',
    PASSWORD_RESET: '30m',
    ACCESS: '10d',
  };

  // Private method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    return argon.hash(password);
  }

  // Private method to verify passwords
  private async verifyPassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return argon.verify(hashedPassword, password);
  }

  // Private method to generate tokens
  private async generateToken(
    userId: string,
    email: string,
    roles: ROLE[],
    expiresIn: string,
  ): Promise<string> {
    const payload = { sub: userId, email, roles };
    return this.jwt.signAsync(payload, {
      expiresIn,
      secret: process.env.JWT_SECRET,
    });
  }

  // Private method to verify tokens
  private verifyToken(token: string): any {
    try {
      return this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Private method to send emails
  private async sendEmail(
    email: string,
    subject: string,
    content: string,
  ): Promise<void> {
    await this.mailService.sendEmail(email, subject, content);
  }

  // Signup method
  async signup(dto: SignupDto): Promise<{ message: string }> {
    const { email, password, name, user_phone, secondary_user_phone } = dto;
    const hashedPassword = await this.hashPassword(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
          user_phone,
          secondary_user_phone,
        },
      });

      await this.sendVerificationEmail(user);

      return {
        message: 'User created successfully, verification email sent.',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // Private method to send verification email
  private async sendVerificationEmail(user: any): Promise<void> {
    const token = await this.generateToken(
      user.id,
      user.email,
      user.role,
      this.TOKEN_EXPIRY.VERIFICATION,
    );
    const verificationLink = `${process.env.VERIFY_USER_URL}/verify-user/${token}`;
    const emailContent = `Please verify your email by clicking the following link: ${verificationLink}`;

    await this.sendEmail(user.email, 'Email Verification', emailContent);
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.sendVerificationEmail(user);
    return { message: 'Verification email sent successfully' };
  }

  // Verify user
  async verifyUser(token: string): Promise<{ message: string }> {
    const payload = this.verifyToken(token);
    const userId = payload.sub;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return { message: 'User verified successfully' };
  }

  // Signin method
  async signin(dto: SigninDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash)
      throw new UnauthorizedException('Invalid email or password');

    const passwordMatches = await this.verifyPassword(
      user.password_hash,
      password,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('Invalid email or password');

    if (!user.email_verified)
      throw new UnauthorizedException('Email not verified');

    const token = await this.generateToken(
      user.id,
      user.email,
      user.role,
      this.TOKEN_EXPIRY.ACCESS,
    );

    return { access_token: token };
  }

  // Change password
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordMatches = await this.verifyPassword(
      user.password_hash,
      oldPassword,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('Incorrect old password');

    const hashedNewPassword = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = await this.generateToken(
      user.id,
      user.email,
      user.role,
      this.TOKEN_EXPIRY.PASSWORD_RESET,
    );
    const resetLink = `${process.env.RESET_PASSWORD_URL}/${token}`;
    const emailContent = `Click the link to reset your password: ${resetLink}`;

    await this.sendEmail(email, 'Password Reset Request', emailContent);

    return { message: 'Password reset link has been sent to your email' };
  }

  // Reset password
  async resetPassword(dto: ResetPassDto): Promise<{ message: string }> {
    const { token, new_password } = dto;
    const payload = this.verifyToken(token);
    const userId = payload.sub;

    const hashedPassword = await this.hashPassword(new_password);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }
}