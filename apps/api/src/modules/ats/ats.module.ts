import { Module } from '@nestjs/common';
import { AtsService } from './ats.service';
import { AtsController } from './ats.controller';

@Module({
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}
