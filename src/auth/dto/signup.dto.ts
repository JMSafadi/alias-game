import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
    @IsNotEmpty({ message: 'This field is required.' })
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    readonly email: string;

    @IsNotEmpty({ message: 'This fild is required.' })
    @IsString()
    @MinLength(4, { message: 'Username must be at least 4 characters long.' })
    readonly username: string;

    @IsNotEmpty({ message: 'This fild is required.' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    readonly password: string;
}
