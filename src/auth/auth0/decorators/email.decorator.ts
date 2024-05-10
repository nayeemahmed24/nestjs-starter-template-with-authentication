import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const Email = createParamDecorator<string>(
    (data: any, ctx: ExecutionContext): string => {
        if (data) return data;
        const request: Request = ctx.switchToHttp().getRequest();
        const email = request.body['email'];
        if (!email)
            throw new UnauthorizedException('Missing email address');
        return email;
    },
);
