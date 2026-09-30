import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from './auth/jwt/jwt.service';
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';

@Module({
  controllers: [AppController],
  providers: [AppService, JwtService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WorkspaceModule,
    WorkspaceMembersModule,
  ],
})
export class AppModule {}
