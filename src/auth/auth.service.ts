// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { Prisma, ROLE, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ResetPassDto } from './dto/resetpass.dto';
import { ChangePasswordDto } from './dto/changepass.dto';
import { EmailDto } from 'src/dtos-common/email.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
    const payload = { sub: userId, email, roles }; // 'roles' included
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
    } catch (error) {
      this.logger.error('Token verification failed', error.stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Private method to send emails
  private async sendEmail(
    email: string,
    subject: string,
    content: string,
  ): Promise<void> {
    try {
      await this.mailService.sendEmail(email, subject, content);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // Signup method
  async signup(dto: SignupDto) {
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
          email_verified: true,
        },
      });

      const token = await this.generateToken(
        user.id,
        user.email,
        user.roles,
        this.TOKEN_EXPIRY.ACCESS,
      );

      return { access_token: token };

      // await this.sendVerificationEmail(user);

      // return {
      //   message: 'User created successfully, verification email sent.',
      // };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or phone number already exists');
      }
      this.logger.error('Failed to sign up user', error.stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // Private method to send verification email
  private async sendVerificationEmail(user: User): Promise<void> {
    try {
      const token = await this.generateToken(
        user.id,
        user.email,
        user.roles,
        this.TOKEN_EXPIRY.VERIFICATION,
      );
      const verificationLink = `${process.env.VERIFY_USER_URL}/verify-user/${token}`;
      const emailContent = `Please verify your email by clicking the following link: ${verificationLink}`;

      await this.sendEmail(user.email, 'Email Verification', emailContent);
    } catch (error) {
      this.logger.error('Failed to send verification email', error.stack);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');

      await this.sendVerificationEmail(user);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to resend verification email', error.stack);
      throw error;
    }
  }

  // Verify user
  async verifyUser(token: string): Promise<{ message: string }> {
    try {
      const payload = this.verifyToken(token);
      const userId = payload.sub;

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { email_verified: true },
      });

      if (!user) throw new NotFoundException('User not found');

      return { message: 'User verified successfully' };
    } catch (error) {
      this.logger.error('User verification failed', error.message);
      throw error;
    }
  }

  // Signin method
  async signin(dto: SigninDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatches = await this.verifyPassword(
        user.password_hash,
        password,
      );
      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // if (!user.email_verified) {
      //   throw new UnauthorizedException('Email not verified');
      // }

      const token = await this.generateToken(
        user.id,
        user.email,
        user.roles,
        this.TOKEN_EXPIRY.ACCESS,
      );

      return { access_token: token };
    } catch (error) {
      this.logger.error('Signin failed', error.stack);
throw new InternalServerErrorException('An unexpected error occurred', error.message);
    }
  }

  // Change password
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = dto;

    try {
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
    } catch (error) {
      this.logger.error('Failed to change password', error.stack);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: EmailDto): Promise<{ message: string }> {
    try {
      const email_str = email.toString();
      const user = await this.prisma.user.findUnique({ where: { email: email_str } });
      if (!user) throw new NotFoundException('User not found');

      const token = await this.generateToken(
        user.id,
        user.email,
        user.roles,
        this.TOKEN_EXPIRY.PASSWORD_RESET,
      );
      const resetLink = `${process.env.RESET_PASSWORD_URL}/${token}`;
      const emailContent = `Click the link to reset your password: ${resetLink}`;

      await this.sendEmail(email_str, 'Password Reset Request', emailContent);

      return { message: 'Password reset link has been sent to your email' };
    } catch (error) {
      this.logger.error('Failed to process forgot password', error.stack);
      throw error;
    }
  }

  // Reset password
  async resetPassword(dto: ResetPassDto): Promise<{ message: string }> {
    const { token, new_password } = dto;

    try {
      const payload = this.verifyToken(token);
      const userId = payload.sub;

      const hashedPassword = await this.hashPassword(new_password);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error('Failed to reset password', error.stack);
      throw error;
    }
  }


  async googleLogin(req, res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }
  
    const { email, name, picture } = req.user;
  
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          user_pfp_link: picture,
          email_verified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { email },
        data: {
          email,
          name,
          user_pfp_link: picture,
          email_verified: true,
        },
      });
    }
  
    const token = await this.generateToken(
      user.id,
      user.email,
      user.roles,
      this.TOKEN_EXPIRY.ACCESS,
    );
    // return res.redirect(`http://localhost:3000/auth/print-token?token=${token}`);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);
  
  }
}
