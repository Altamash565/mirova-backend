import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants';
import {
  users,
  refreshSessions,
} from '../database/schema';

import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,

    private readonly jwtService: JwtService,
  ) {}

  // ============================================
  // REGISTER
  // ============================================

  async register(
    name: string,
    email: string,
    password: string,
  ) {
    // 1. Check whether email already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    // 3. Create user
    const [user] = await this.db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      });

    // 4. Generate access token
    const accessToken =
      this.jwtService.generateAccessToken(
        user.id,
      );

    // 5. Create refresh session
    const refreshToken =
      await this.createRefreshSession(user.id);

    // 6. Return response
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // ============================================
  // LOGIN
  // ============================================

  async login(
    email: string,
    password: string,
  ) {
    // 1. Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 2. Compare password
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 3. Generate access token
    const accessToken =
      this.jwtService.generateAccessToken(
        user.id,
      );

    // 4. Create refresh session
    const refreshToken =
      await this.createRefreshSession(user.id);

    // 5. Return safe user data
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },

      accessToken,
      refreshToken,
    };
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================

  async refresh(refreshToken: string) {
    // 1. Verify JWT signature + type + payload
    const payload =
      this.jwtService.verifyRefreshToken(
        refreshToken,
      );

    // 2. Extract user ID and session ID
    const userId = payload.sub;
    const sessionId = payload.sid;

    // 3. Find session
    const [session] = await this.db
      .select()
      .from(refreshSessions)
      .where(
        and(
          eq(refreshSessions.id, sessionId),
          eq(refreshSessions.userId, userId),
        ),
      );

    if (!session) {
      throw new UnauthorizedException(
        'Refresh session not found',
      );
    }

    // 4. Check whether session was revoked
    if (session.revokedAt) {
      throw new UnauthorizedException(
        'Refresh session has been revoked',
      );
    }

    // 5. Check whether session has expired
    if (
      new Date() >= session.expiresAt
    ) {
      throw new UnauthorizedException(
        'Refresh session has expired',
      );
    }

    // 6. Compare supplied refresh token with hashed token stored in database
    const isTokenValid =
      await this.compareRefreshToken(
        refreshToken,
        session.tokenHash,
      );

    if (!isTokenValid) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // 7. Generate new access token
    const newAccessToken =
      this.jwtService.generateAccessToken(
        userId,
      );

    // 8. Generate new refresh token
    // using SAME session ID
    const newRefreshToken =
      this.jwtService.generateRefreshToken(
        userId,
        sessionId,
      );

    // 9. Hash new refresh token
    const newTokenHash =
      await this.hashRefreshToken(
        newRefreshToken,
      );

    // 10. Rotate stored refresh token
    await this.db
      .update(refreshSessions)
      .set({
        tokenHash: newTokenHash,
      })
      .where(
        eq(refreshSessions.id, sessionId),
      );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ============================================
  // LOGOUT
  // ============================================

  async logout(userId: string) {
    await this.db
      .update(refreshSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshSessions.userId, userId),
        ),
      );

    return {
      message: 'Logout successful',
    };
  }

  // ============================================
  // CREATE REFRESH SESSION
  // ============================================

  private async createRefreshSession(
    userId: string,
  ) {
    // Create session first
    const [session] = await this.db
      .insert(refreshSessions)
      .values({
        userId,

        // Temporary value because we need
        // session.id before creating JWT
        tokenHash: 'temporary',

        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000,
        ),
      })
      .returning({
        id: refreshSessions.id,
      });

    // Generate refresh token
    const refreshToken =
      this.jwtService.generateRefreshToken(
        userId,
        session.id,
      );

    // Hash refresh token
    const tokenHash =
      await this.hashRefreshToken(
        refreshToken,
      );

    // Store hash
    await this.db
      .update(refreshSessions)
      .set({
        tokenHash,
      })
      .where(
        eq(
          refreshSessions.id,
          session.id,
        ),
      );

    return refreshToken;
  }

  // ============================================
  // HASH REFRESH TOKEN
  // ============================================

  private async hashRefreshToken(
    refreshToken: string,
  ) {
    return bcrypt.hash(
      refreshToken,
      12,
    );
  }

  // ============================================
  // COMPARE REFRESH TOKEN
  // ============================================

  private async compareRefreshToken(
    refreshToken: string,
    tokenHash: string,
  ) {
    return bcrypt.compare(
      refreshToken,
      tokenHash,
    );
  }
}