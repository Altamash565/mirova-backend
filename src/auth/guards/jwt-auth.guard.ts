import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';

import { Request } from 'express';

import { JwtService } from '../jwt/jwt.service';
import { throwError } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    canActivate (
        context: ExecutionContext,
    ) : boolean {
        const request = 
        context.switchToHttp().getRequest<Request>();

        const authHeader = 
        request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException(
                'Authorization header is required',
            );
        }

        const [type, token] = 
        authHeader.split(' ');

        if (
            type !== 'Bearer' || !token
        ) {
            throw new UnauthorizedException(
                'Invalid authorization format'
            );
        }

        const payload = this.jwtService.verifyAccessToken(
            token,
        );

        if (
            typeof payload !== 'object' || !('sub' in payload) || typeof payload.sub !== 'string'
        ) {
            throw new UnauthorizedException(
                'Invalid access token',
            );
        }

        request['user'] = {
            id: payload.sub,
        };
        
        return true;
    }
}