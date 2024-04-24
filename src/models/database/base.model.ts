/* istanbul ignore file */
import { Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class DBBaseEntity {
    constructor() {
        const today = new Date();
        this.lastUpdateDate = this.creationDate = today.toUTCString();
    }
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ name: 'creation_date', type: 'timestamptz', default: null })
    public creationDate: string;

    @Column({ name: 'last_update_date', type: 'timestamptz', default: null })
    public lastUpdateDate: string;
}
