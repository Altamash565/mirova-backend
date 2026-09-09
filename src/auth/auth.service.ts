import { Injectable, BadRequestException, Inject, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import {eq} from 'drizzle-orm'

import {DATABASE} from '../database/database.constants';
import {users} from '../database/schema';

import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
    constructor (
        @Inject(DATABASE) 
        private readonly db: any,

        private readonly JwtService: JwtService,
     ) {}

     async register(
        name: string,
        email: string,
        password: string,
     )  {
        // 1. Check whether email already exists
        const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));

        if(existingUser.length > 0) {
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
            createdAt: users.createdAt
        });

        // 4. Generate tokens
        const accessToken = 
        this.JwtService.generateAccessToken(user.id);

        const refreshToken = 
        this.JwtService.generateRefreshToken(user.id);

        // 5. Return response
        return {
            user,
            accessToken, 
            refreshToken,
        };

     }

     async login(email: string, password: string) {
        // 1. Find user by email
        const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));

        if(!user) {
            throw new BadRequestException(
                'Invalid email or password',
            );
        }

        // 2. Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if(!isPasswordValid) {
            throw new BadRequestException(

                'Invalid email or password',
            );
        }

        // 3. Generate tokens
        const accessToken = 
        this.JwtService.generateAccessToken(user.id);

        const refreshToken =
        this.JwtService.generateRefreshToken(user.id);

        // 4. Return safe user data
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
            refreshToken
        };
    }

    async refresh(refreshToken: string) {
        const payload = this.JwtService.verifyRefreshToken(
            refreshToken,
        );

        if (
            typeof payload !== 'object' || !('sub' in payload) || typeof payload.sub !== 'string'
        ) {
            throw new UnauthorizedException(
                'Invalid refresh token',
            );
        }

        const userId = payload.sub;

        const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

        if(!user) {
            throw new UnauthorizedException(

                'User not found',
            );
        }

        const newAccessToken = this.JwtService.generateAccessToken(
            user.id,
        );

        const newRefreshToken = this.JwtService.generateRefreshToken(
            user.id,
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(userId: string) {
        return {
            message: 'Logout not successfully',
        };
    }

}
