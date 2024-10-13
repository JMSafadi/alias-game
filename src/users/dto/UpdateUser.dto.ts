import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(4, { message: 'Username must be at least 4 characters long.' })
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password?: string;
}