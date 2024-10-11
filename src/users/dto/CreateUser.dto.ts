import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../modules/common/roles/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  roles: Role;
}
