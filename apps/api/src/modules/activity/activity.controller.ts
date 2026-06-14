import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get('timeline')
  timeline(@CurrentUser('id') userId: string, @Query('take') take?: string) {
    return this.activity.timeline(userId, take ? Number(take) : undefined);
  }

  @Get('kanban')
  kanban(@CurrentUser('id') userId: string) {
    return this.activity.kanban(userId);
  }

  @Get('feed')
  feed(@CurrentUser('id') userId: string) {
    return this.activity.feed(userId);
  }
}
