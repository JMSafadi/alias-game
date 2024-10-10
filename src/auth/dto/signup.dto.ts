import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../modules/common/roles/role.enum';

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;

    @IsString()
    roles: Role;
}
