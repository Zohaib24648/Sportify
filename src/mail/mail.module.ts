// mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './mailer.config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [MailerModule.forRoot(mailerConfig)],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService], // Export if used by other modules
})
export class MailModule {}
