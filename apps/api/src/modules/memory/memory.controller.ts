import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MemoryType } from '@acm/database';
import { MemoryService } from './memory.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('memory')
@ApiBearerAuth()
@Controller('memory')
export class MemoryController {
  constructor(private memory: MemoryService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('type') type?: MemoryType) {
    return this.memory.list(userId, type);
  }

  @Get('recall')
  recall(@CurrentUser('id') userId: string, @Query('q') q: string) {
    return this.memory.recall(userId, q ?? '');
  }

  @Delete(':id')
  forget(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.memory.forget(userId, id);
  }
}
