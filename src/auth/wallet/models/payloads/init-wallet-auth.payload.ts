/* istanbul ignore file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class InitializeWalletAuthPayload {
    @ApiProperty({
        example: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5"
    })
    @IsNotEmpty()
    public publicAddress: string;
}
