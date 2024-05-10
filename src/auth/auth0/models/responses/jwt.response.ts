/* istanbul ignore file */
export class JwtResponse {
    constructor(access: string, refreshToken: string) {
        this.access_token = access;
        this.refresh_token = refreshToken;
    }
    public access_token: string;
    public refresh_token: string;
}
