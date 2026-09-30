import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [WorkspaceMembersService],
  controllers: [WorkspaceMembersController],
})
export class WorkspaceMembersModule {}
