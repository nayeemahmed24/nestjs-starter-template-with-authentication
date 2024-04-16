/* istanbul ignore file */
import { Column, Entity, OneToMany } from 'typeorm';
import { DBBaseEntity } from './base.model';
import { Role } from '../enum/role.enum';
import DBToken from './token.model';

@Entity({ name: 'users' })
class DBUser extends DBBaseEntity {
    constructor() {
        super();
        this.joiningDate = this.lastLoginDate = this.creationDate;
    }
    
    @Column({ name: 'name', type: String, default: null })
    public name: string;

    @Column({ name: 'email', type: String, default: null })
    public email: string;

    @Column({ name: 'password', type: String, default: null })
    public password: string;

    @Column({ name: 'wallet_address', type: String, default: null })
    public walletAddress: string;
    
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER, // Default role for new users
    })
    role: Role;

    @Column({ name: 'joining_date', type: 'timestamptz', default: null })
    public joiningDate: string;

    @Column({ name: 'last_login_date', type: 'timestamptz', default: null })
    public lastLoginDate: string;

    @Column({ name: 'is_active', type: Boolean, default: true })
    public isActive: boolean;

    @OneToMany(() => DBToken, token => token.user)
    tokens: DBToken[];
}

export default DBUser;
