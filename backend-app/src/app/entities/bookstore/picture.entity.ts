import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Bookdetails } from './bookdetails.entity';

@Entity()
export class Picture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @ManyToOne(type => Bookdetails, (bookdetails) => bookdetails.pictures)
  bookdetails: Bookdetails;
}
