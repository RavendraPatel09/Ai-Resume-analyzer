import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { atsScanRequestSchema, type AtsScanRequest } from '@acm/shared';
import { AtsService } from './ats.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ats')
@ApiBearerAuth()
@Controller('ats')
export class AtsController {
  constructor(private ats: AtsService) {}

  @Get('scans')
  list(@CurrentUser('id') userId: string) {
    return this.ats.list(userId);
  }

  @Post('scan')
  scan(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(atsScanRequestSchema)) dto: AtsScanRequest,
  ) {
    return this.ats.scan(userId, dto);
  }
}
