import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { UsersModule } from './modules/users/users.module';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { APP_GUARD } from '@nestjs/core';
import { BetterAuthModule } from './lib/auth.module';
import { EstablishmentModule } from './modules/establishment/establishment.module';
import { DatabaseModule } from './database/database.module';
import { SchoolYearModule } from './modules/school-year/school-year.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    DatabaseModule,
    BetterAuthModule,
    UsersModule,
    EstablishmentModule,
    SchoolYearModule,
  ],

  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
