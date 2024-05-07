import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const Wallet = createParamDecorator<string>(
    (data: any, ctx: ExecutionContext): string => {
        if (data) return data;
        const request: Request = ctx.switchToHttp().getRequest();
        const wallet = request.body['wallet'];
        if (!wallet)
            throw new UnauthorizedException('Missing wallet address');
        return wallet;
    },
);
