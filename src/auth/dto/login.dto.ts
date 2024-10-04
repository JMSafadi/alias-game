import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;
}
