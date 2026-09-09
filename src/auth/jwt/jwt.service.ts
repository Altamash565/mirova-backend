import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  generateAccessToken(userId: string) {
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
      '15m') as SignOptions['expiresIn'];
    return jwt.sign(
      {
        sub: userId,
        type: 'access',
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: expiresIn,
      },
    );
  }

  generateRefreshToken(userId: string) {
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as SignOptions['expiresIn'];
    return jwt.sign(
      {
        sub: userId,
        type: 'refresh',
      },

      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: expiresIn,
      },
    );
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
