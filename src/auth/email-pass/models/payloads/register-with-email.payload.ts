import { Role } from "src/models/enum/role.enum";

/* istanbul ignore file */
export class RegisterWithEmailPayload {
    public email: string;
    public password: string;
    public name: string;
    public role: Role;
}
