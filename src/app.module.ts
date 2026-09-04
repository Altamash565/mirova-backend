import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';


@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [HealthModule],
})
export class AppModule {}
