import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

type RefreshTokenPayload = {
  sub: string;
  type: 'refresh';
  sid: string;
};

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

  generateRefreshToken(userId: string, sessionId: string) {
  const expiresIn =
    (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

  console.log(
    'JWT_REFRESH_EXPIRES_IN:',
    JSON.stringify(process.env.JWT_REFRESH_EXPIRES_IN),
  );

  console.log(
    'expiresIn:',
    JSON.stringify(expiresIn),
  );

  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
      sid: sessionId,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn,
    },
  );
}
  verifyAccessToken(token: string) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      );

      if (
        typeof payload !== 'object' || 
        payload.type !== 'access'
      ) {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }

      return payload;

    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!,
      );

      if (
        typeof payload !== 'object' ||
        payload == null || 
        payload.type !== 'refresh'
      ) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      if (
        typeof payload.sub !== 'string' || 
        typeof payload.sid !== 'string'
      ) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      return {
        sub: payload.sub,
        type: 'refresh',
        sid: payload.sid,
      };
      
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token'
      );
    }
  }
}
