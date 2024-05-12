import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Auth0LoginPayload {
    @ApiProperty({
        example: '4bJxqcKeUv2iisf1gu6R1e0S93ONPHdnpCYc03fIyKh4h'
    })
    @IsNotEmpty()
    public code: string;
}
