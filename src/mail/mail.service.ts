// mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService, private readonly prisma : PrismaService) {}

  async sendEmail(to: string, subject: string, content: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: content,
      });
      return 'Email sent successfully';
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to send email: ${error.message}`,
      );
    }
  }



}
