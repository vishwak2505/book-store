// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bookdetails } from './bookdetails.entity';
import { Bookrented } from './bookrented.entity';

@Entity()
export class Book extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Bookdetails, (book_details) => book_details.books)
  book_details: Bookdetails;

  @OneToOne(type => Bookrented, (bookrented) => bookrented.book)
  book_rented: Bookrented
}
