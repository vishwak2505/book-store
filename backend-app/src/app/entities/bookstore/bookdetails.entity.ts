import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Bookdetails extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  book_name: string;

  @Column()
  genre: string;

  @Column()
  total_no_of_copies: number;

  @Column({ nullable: true })
  no_of_copies_rented: number;

  @Column()
  cost_per_day: number;

  @OneToMany(type => Book, (book) => book.book_details)
  books: Book[];
}
