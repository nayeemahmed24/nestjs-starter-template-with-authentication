import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CollectEmailMiddlewareFromAuth0 implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}
    use(req: Request, res: Response, next: NextFunction): any {
        let email;
        try {
            const authorizationHeaderValue = req.headers['authorization'];
            const token = authorizationHeaderValue.replace('Bearer ', '');
            const tokenInfo = this.jwtService.decode(token);
            email = tokenInfo['email'];
        } catch (e) {}

        req.body['email'] = email;
        next();
    }
}
