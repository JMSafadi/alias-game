import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../modules/common/roles/role.enum';


export class UpdateUserDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'johndoe@email.com',
    })
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email?: string;

    @ApiProperty({
        description: 'The username of the user',
        example: 'johndoe',
    })
    @IsOptional()
    @IsString()
    @MinLength(4, { message: 'Username must be at least 4 characters long.' })
    username?: string;

    @ApiProperty({
        description: 'The password for the user',
        example: 'securePassword123',
    })
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password?: string;

    @ApiPropertyOptional({
        description: 'Roles assigned to the user',
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