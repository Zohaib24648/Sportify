// auth/strategy/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Ensure the role is an array, as you may have multiple roles
    return {
      userId: payload.sub,
      email: payload.email,
      role: Array.isArray(payload.role) ? payload.role : [payload.role], // Ensure role is always an array
    };
  }
}
