import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { Role } from '../../modules/common/roles/role.enum';

@Injectable()
export class AdminSeedService {
    constructor(private readonly usersService: UsersService) { }

    async seedAdmin() {
        const adminEmail = 'superadmin@admin.com';
        const existingAdmin = await this.usersService.findByEmail(adminEmail);

        if (!existingAdmin) {
            await this.usersService.create({
                username: 'superadmin',
                email: adminEmail,
                password: 'securePassword123',
                roles: [Role.Admin],
            });
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists.');
        }
    }
}
