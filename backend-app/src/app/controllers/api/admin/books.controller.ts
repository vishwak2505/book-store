import { Context, Delete, Get, HttpResponseCreated, HttpResponseNoContent, HttpResponseNotFound, HttpResponseNotImplemented, HttpResponseOK, Patch, PermissionRequired, Post, UseSessions, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam, dependency } from '@foal/core';
import { LoggerService } from '../../../../helper/logger';
import { Bookdetails } from '../../../entities/bookstore';

export class BooksController {

  @dependency
  logger: LoggerService;

  @Get('/allBooks')
  @UserRequired()
  @PermissionRequired('view-book')
  async getAllBooks() {

    let queryBuilder = Bookdetails
      .createQueryBuilder('book')
      .select([
        'book.book_name',
        'book.genre',
        'book.total_no_of_copies',
        'book.no_of_copies_rented',
        'book.cost_per_day'
      ]);

    const books = await queryBuilder.getMany();

    return new HttpResponseOK(books);
  }

  @Post('/add')
  @UserRequired()
  @PermissionRequired('add-book')
  @ValidateBody({
    type: 'object',
    properties: {
      bookName: { type: 'string', maxLength: 255 },
      genre: { type: 'string', maxLength: 255 },
      totalNoOfCopies: { type: 'number' },
      costPerDay: { type: 'number' }
    },
    required: [ 'bookName', 'genre', 'totalNoOfCopies', 'costPerDay' ],
    additionalProperties: false,
  })
  async addbook(ctx: Context<Bookdetails>) {
    const book = new Bookdetails();
    book.book_name = ctx.request.body.bookName;
    book.genre = ctx.request.body.genre;
    book.total_no_of_copies = ctx.request.body.totalNoOfCopies;
    book.no_of_copies_rented = 0;
    book.cost_per_day = ctx.request.body.costPerDay;
    console.log(book);
    try {
      await book.save();
      return new HttpResponseCreated(book);
    } catch(e) {
      return new HttpResponseNotImplemented();
    }
    
  }

  @Patch('/update')
  @UserRequired()
  @PermissionRequired('update-book') 
  async updateBook() {

  }

  @Delete('/:bookName')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidatePathParam('bookName', { type: 'string' })
  async deleteBook(ctx: Context<Bookdetails>, { bookName }: { bookName: string }) {
    const book = await Bookdetails.findOneBy({ book_name: bookName });

    if (!book) {
      return new HttpResponseNotFound();
    }

    await book.remove();

    return new HttpResponseOK(book);
  }
}
