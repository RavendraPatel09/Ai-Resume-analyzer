import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationStatus } from '@acm/database';
import { RecommendationService } from './recommendation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationController {
  constructor(private recs: RecommendationService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('status') status?: RecommendationStatus) {
    return this.recs.list(userId, status);
  }

  @Get('next-action')
  nextAction(@CurrentUser('id') userId: string) {
    return this.recs.nextActionState(userId);
  }

  @Patch(':id/complete')
  complete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recs.complete(userId, id);
  }

  @Patch(':id/dismiss')
  dismiss(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recs.dismiss(userId, id);
  }
}
