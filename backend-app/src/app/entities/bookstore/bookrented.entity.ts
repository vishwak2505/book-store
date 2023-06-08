import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';
import { Book } from './book.entity';

@Entity()
export class Bookrented extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date_of_issue: Date;

  @Column({ nullable: true })
  date_of_return: Date;

  @ManyToOne(type => User, (user) => user.book_rented)
  user: User;

  @OneToOne(type => Book)
  @JoinColumn()
  book: Book;
}
