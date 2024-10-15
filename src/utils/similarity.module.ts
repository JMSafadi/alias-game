import { Module } from '@nestjs/common';
import { SimilarityService } from './similarity.service';

@Module({
  providers: [SimilarityService],
  exports: [SimilarityService],
})
export class SimilarityModule {}
