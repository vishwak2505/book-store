import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Bookdetails } from './bookdetails.entity';
import { Bookrented } from './bookrented.entity';

@Entity()
export class Book extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Bookdetails, (book_details) => book_details.books, { onDelete: 'CASCADE' , nullable: false})
  book_details: Bookdetails;

  @Column({ default: true })
  availability: boolean;
  
  @OneToOne(type => Bookrented, (bookrented) => bookrented.book, { nullable: true })
  book_rented: Bookrented;
}
