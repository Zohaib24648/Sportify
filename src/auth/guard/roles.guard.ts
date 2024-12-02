// guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);

    // Ensure user.roles is always an array
    const userRoles = Array.isArray(user?.role) ? user.role : [user?.role];

    return matchRoles(roles, userRoles);
  }
}

function matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
  // Check if any of the user's roles match any of the required roles
  return requiredRoles.some((role) => userRoles.includes(role));
}
