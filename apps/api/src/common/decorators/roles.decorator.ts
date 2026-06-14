import { SetMetadata } from '@nestjs/common';
import { Role } from '@acm/database';

export const ROLES_KEY = 'roles';
/** Restricts a route to one or more roles. Used with RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
