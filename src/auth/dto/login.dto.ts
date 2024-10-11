import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'This field is required.' })
    @IsString()
    readonly usernameOrEmail: string;

    @IsNotEmpty({ message: 'This fild is required.' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    readonly password: string;
}
