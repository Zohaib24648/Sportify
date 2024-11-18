//guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true; // No roles required, allow access
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);
    return matchRoles(roles, user?.role);
  }
}

function matchRoles(roles: string[], userRole: string): boolean {
  return roles.includes(userRole);
}

