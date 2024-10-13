import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../modules/common/roles/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password for the user',
    example: 'securePassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Roles assigned to the user (not needed for regular users)',
    enum: Role,
    examples: {
      adminExample: {
        summary: 'Role for admin',
        value: Role.Admin,
      },
    },
  })
  @IsOptional()
  @IsString()
  roles: Role;
}
