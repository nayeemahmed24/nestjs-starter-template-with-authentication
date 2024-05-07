/* istanbul ignore file */
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DBBaseEntity } from './base.model';
import DBUser from './user.model';

@Entity({ name: 'tokens' })
class DBToken extends DBBaseEntity {
    constructor() {
        super();
    }
    
    @Column({ name: 'refresh_token', type: String, default: null })
    public refreshToken: string;

    @ManyToOne(() => DBUser, user => user.tokens)
    user: DBUser;
}

export default DBToken;
