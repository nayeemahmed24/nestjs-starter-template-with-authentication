import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CollectWalletMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}
    use(req: Request, res: Response, next: NextFunction): any {
        let wallet;
        try {
            const authorizationHeaderValue = req.headers['authorization'];
            const token = authorizationHeaderValue.replace('Bearer ', '');
            const tokenInfo = this.jwtService.decode(token);
            wallet = tokenInfo['sub'];
        } catch (e) {}

        req.body['wallet'] = wallet;
        next();
    }
}
