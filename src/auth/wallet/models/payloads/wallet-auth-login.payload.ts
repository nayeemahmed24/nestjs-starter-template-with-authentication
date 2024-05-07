import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WalletAuthLoginPayload {
    @ApiProperty({
        example: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5"
    })
    @IsNotEmpty()
    public publicAddress: string;

    @ApiProperty({
        example: "0x6e3842f93620ffff1901cee3434ccd4e289aee2fac151646afd6282a594920d43aa98d82c2faa21092175d85334c2f81675f70904d0af7508a4df447b63e82d81c"
    })
    @IsNotEmpty()
    public signature: string;
}
