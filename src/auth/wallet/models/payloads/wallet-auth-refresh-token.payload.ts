import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class WalletAuthRefreshTokenPayload {
    @ApiProperty({
        example: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5"
    })
    @IsNotEmpty()
    public publicAddress: string;

    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    })
    @IsNotEmpty()
    public refreshToken: string;
}
