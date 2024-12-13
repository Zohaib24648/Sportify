// mailer.config.ts
import { MailerOptions } from '@nestjs-modules/mailer';
import * as path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  transport: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  defaults: {
    from: `"No Reply" <${process.env.EMAIL_USER}>`,
  },
  template: {
    dir: path.join(__dirname, 'templates'),
    adapter: new HandlebarsAdapter(), 
    options: {
      strict: true,
    },
  },
};
