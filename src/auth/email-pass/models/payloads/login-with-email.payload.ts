import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength } from "class-validator";

/* istanbul ignore file */
export class LoginWithEmailPayload {
    @ApiProperty({
		example: "abc@gmail.com"
	})
    @IsNotEmpty()
    @IsEmail()
    public emailAddress: string;

    @ApiProperty({
		description: "Minimum Length is 6 and maximum is 26",
		example: "123456"
	})
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(26)
    public password: string;
}
