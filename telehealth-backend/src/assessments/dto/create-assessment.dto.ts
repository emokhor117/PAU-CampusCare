import { IsArray, IsString, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  assessment_type: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  responses: number[];
}
