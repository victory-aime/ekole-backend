import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './auth';

@Module({
  imports: [
    AuthModule.forRootAsync({
      useFactory: () => ({
        auth: createAuth(),
      }),
    }),
  ],
  exports: [AuthModule],
})
export class BetterAuthModule {}
