//auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, PrismaClient, ROLE } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPassDto } from './dto/resetpass.dto';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email;
    const hash = await argon.hash(dto.password);
    const name = dto.name;
    const user_phone = dto.user_phone;
    const secondary_user_phone = dto.secondary_user_phone;

    try {
      const user = await this.prisma.user.create({
        data: {
          email: email,
          password_hash: hash,
          name: name,
          user_phone: user_phone,
          secondary_user_phone: secondary_user_phone,
        },
      });
      await this.sendVerificationEmail(user.id, user.email, user.role);

      return { message: 'User created successfully, and Verification Mail Sent' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException('Email or phone number already exists');
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred: ',
        error.message,
      );
    }
  }


  async sendVerificationEmail(id: string, email: string, role: ROLE[]) {
    const signed_token = await this.signToken(id, email, role, '30m');
    const token = signed_token.access_token;

    const link_to_verify = `${process.env.VERIFY_USER_URL}/${token}`;
    console.log(link_to_verify);   
    return await this.mailService.sendEmail(
      email,
      'Verify your email',
      link_to_verify,
    )

}


  async resendVerificationEmail(email:string){
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.sendVerificationEmail(user.id, user.email, user.role);
    return { message: 'Verification email sent successfully'

  }}

  async verifyUser(token: string) {
    try {
      // Decode the token to get the payload
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Extract the user ID from the payload
      const userId = payload.sub;
      // console.log(userId);

      // Find the user in the database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update the user's email verification status
      await this.prisma.user.update({
        where: { id: userId },
        data: { email_verified: true },
      });

      return { message: 'User verified successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to verify user',
        error.message,
      );
    }
  }

  async signin(req: SigninDto) {
    try {
      const { email, password } = req;

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password_hash) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const match = await argon.verify(user.password_hash, password);
      if (!match) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const user_verified = user.email_verified;
      if (!user_verified) {
        throw new UnauthorizedException('Email not verified');
      }

      return this.signToken(user.id, user.email, user.role, '10d');
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to sign in',
        error.message,
      );
    }
  }

  async signToken(
    userid: string,
    email: string,
    role: ROLE[],
    expirytime: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = { sub: userid, email, role };
      const token = await this.jwt.signAsync(payload, {
        expiresIn: expirytime,
        secret: process.env.JWT_SECRET,
      });
      return {
        access_token: token,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to sign token',
        error.message,
      );
    }
  }

  async changePassword(id: string, dto: any) {
    const { oldPassword, newPassword } = dto;
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const match = await argon.verify(user.password_hash, oldPassword);
    if (!match) {
      throw new UnauthorizedException('Incorrect old Password');
    }
    const hash = await argon.hash(newPassword);
    await this.prisma.user.update({
      where: { id },
      data: {
        password_hash: hash,
      },
    });
    return { message: 'Password changed successfully' };
  }


  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a reset token with a short expiry time
    const { access_token } = await this.signToken(user.id, user.email, user.role, '30m');

    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${access_token}`;

    // Send the reset link via email
    await this.mailService.sendEmail(
      email,
      'Password Reset Request',
      `Click the link to reset your password: ${resetLink}`,
    );

    return { message: 'Password reset link has been sent to your email.' };
  }

  async resetPassword(dto: ResetPassDto) {
    const { token, new_password } = dto;

    try {
      // Verify the token
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.sub;

      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update the user's password
      const hash = await argon.hash(new_password);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: hash,
        },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
