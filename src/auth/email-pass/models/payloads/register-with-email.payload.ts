import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "../../../../models/enum/role.enum";

/* istanbul ignore file */
export class RegisterWithEmailPayload {
    @ApiProperty({
		example: "abc@gmail.com"
	})
    @IsNotEmpty()
    @IsString()
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
    
    @ApiProperty()
    @IsNotEmpty()
    @ApiProperty({
		example: "John"
	})
    public name: string;
    
    @ApiProperty({
        enum: Role,
        example: Role.USER
    })
    @IsNotEmpty()
    public role: Role;
}
