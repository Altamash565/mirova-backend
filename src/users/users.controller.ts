import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { UsersService } from './users.service';

import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';



@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(
        @Body()
        body: {
            name: string;
            email: string;
        },
    ) {
        return this.usersService.create(body.name, body.email)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard) 
    getMe(@CurrentUser() user: { id: string}) {
        return {
            message: 'You are authenticated',
            user,
        };
    }

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body()
        body: {
            name?: string;
            email?: string;
        },
    ) {
        return this.usersService.update(id, body.name, body.email)
    }

    @Delete(':id') 
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}


