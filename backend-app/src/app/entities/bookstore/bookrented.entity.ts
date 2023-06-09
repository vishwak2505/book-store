import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';
import { Book } from './book.entity';

export enum bookStatus {
  Active = 'active',
  Closed = 'closed',
}

@Entity()
export class Bookrented extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date_of_issue: Date;

  @Column({ nullable: true })
  date_of_return: Date;

  @Column({ type: 'enum', enum: bookStatus })
  status: bookStatus;

  @ManyToOne(type => User, (user) => user.book_rented, { nullable: false, cascade: true, onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  user: User;

  @ManyToOne(type => Book, (book) => book.book_rented)
  book: Book;
}
