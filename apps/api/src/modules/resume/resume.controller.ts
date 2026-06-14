import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ACCEPTED_RESUME_MIME, MAX_RESUME_BYTES } from '@acm/shared';
import { ResumeService } from './resume.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('resumes')
@ApiBearerAuth()
@Controller('resumes')
export class ResumeController {
  constructor(private resume: ResumeService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.resume.list(userId);
  }

  @Get(':id')
  get(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.resume.get(userId, id);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_RESUME_BYTES } }))
  async upload(
    @CurrentUser('id') userId: string,
    @Body('title') title: string | undefined,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_RESUME_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    if (!(file.mimetype in ACCEPTED_RESUME_MIME)) {
      throw new BadRequestException('Only PDF, DOCX, or TXT files are accepted');
    }
    return this.resume.ingest({
      userId,
      title: title?.trim() || file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.resume.remove(userId, id);
  }
}
