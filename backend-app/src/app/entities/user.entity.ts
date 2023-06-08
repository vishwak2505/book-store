import { UserWithPermissions } from '@foal/typeorm';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bookrented } from './bookstore/bookrented.entity';

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

  @OneToMany(type => Bookrented, (bookrented) => bookrented.user)
  book_rented: Bookrented[];

}

export { Group, Permission, DatabaseSession } from '@foal/typeorm';