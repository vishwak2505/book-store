import { UserWithPermissions } from '@foal/typeorm';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bookrented } from './bookstore/bookrented.entity';

export enum userStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Entity()
export class User extends UserWithPermissions {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: true})
  password: string;

  @Column({nullable: true})
  amount_due:number;

  @Column({nullable: true})
  avatar: string;

  @Column({ type: 'enum', enum: userStatus })
  status: userStatus;

  @OneToMany(type => Bookrented, (bookrented) => bookrented.user)
  book_rented: Bookrented[];

}

export { Group, Permission } from '@foal/typeorm';