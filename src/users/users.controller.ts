import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { UsersService } from './users.service';



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


