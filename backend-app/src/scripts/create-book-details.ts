import { Bookdetails } from '../app/entities/bookstore';
import { dataSource } from '../db';
import { LoggerService } from '../app/services/logger';

export const schema = {
  additionalProperties: false,
  properties: {
    bookName: { type: 'string', maxLength: 255 },
    genre: { type: 'string', maxLength: 255 },
    totalNoOfCopies: { type: 'number' },
    costPerDay : { type: 'number' }
  },
  required: [ 'bookName', 'genre', 'totalNoOfCopies', 'costPerDay' ],
  type: 'object',
};

export async function main(args: { bookName: string, genre: string, totalNoOfCopies: number, costPerDay: number }) {
  const logger = new LoggerService(); 
  await dataSource.initialize();

  const bookDetails = new Bookdetails();
  bookDetails.book_name = args.bookName;
  bookDetails.genre = args.genre;
  bookDetails.total_no_of_copies = args.totalNoOfCopies;
  bookDetails.cost_per_day = args.costPerDay;
  bookDetails.no_of_copies_rented = 0;

  try {
    console.log(await bookDetails.save());
  } catch (error: any) {
    logger.error(error);
  } finally {
    await dataSource.destroy();
  }
}

