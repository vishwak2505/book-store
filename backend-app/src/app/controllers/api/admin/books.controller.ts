import { Context, Delete, Get, HttpResponseBadRequest, HttpResponseCreated, HttpResponseNoContent, HttpResponseNotFound, HttpResponseNotImplemented, HttpResponseOK, Patch, PermissionRequired, Post, UseSessions, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam, dependency } from '@foal/core';
import { LoggerService } from '../../../../helper/logger';
import { Book, Bookdetails } from '../../../entities/bookstore';

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

  @Get('/:bookName')
  @PermissionRequired('view-book')
  @UserRequired()
  @ValidatePathParam('bookName', { type: 'string' })
  async getBook(ctx: Context, { bookName }: { bookName: string }) {
    console.log(bookName);
    try {
      const book = await Bookdetails.findOne({where: { book_name: bookName }});

      if (!book) {
        throw new HttpResponseNotFound('No Book Found');
      }

      return new HttpResponseOK(book);
    } catch (e) {
      return e as Error;
    }
    
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
    const bookDetails = new Bookdetails();
    
    bookDetails.book_name = ctx.request.body.bookName;
    bookDetails.genre = ctx.request.body.genre;
    bookDetails.total_no_of_copies = ctx.request.body.totalNoOfCopies;
    bookDetails.no_of_copies_rented = 0;
    bookDetails.cost_per_day = ctx.request.body.costPerDay;

    try {
      await bookDetails.save();
      for (let i = 0; i < ctx.request.body.totalNoOfCopies; i++) {
        const book = new Book();
        book.availability = true;
        book.book_details = bookDetails;
        try {
          await book.save();
        } catch (e) {
          console.log(e);
          return new HttpResponseBadRequest();
        }
      }
      return new HttpResponseCreated(bookDetails);
    } catch(e) {
      return new HttpResponseNotImplemented();
    }
    
  }

  // @Patch('/update')
  // @UserRequired()
  // @PermissionRequired('update-book') 
  // @ValidateBody({
  //   type: 'object',
  //   properties: {
  //     bookId: { type: 'number' },
  //     bookName: { type: 'string', maxLength: 255 },
  //     genre: { type: 'string', maxLength: 255 },
  //     totalNoOfCopies: { type: 'number' },
  //     costPerDay: { type: 'number' }
  //   },
  //   required: [ 'bookId' ],
  //   additionalProperties: false,
  // })
  // async updateBook(ctx: Context<Bookdetails>) {
  //   const book = await Bookdetails.findOneBy({ id: ctx.request.body.bookId });


  // }

  @Delete('/:bookName')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidatePathParam('bookName', { type: 'string' })
  async deleteBook({ bookName }: { bookName: string }) {
    const bookDetails = await Bookdetails.findOneBy({ book_name: bookName });

    if (!bookDetails) {
      return new HttpResponseNotFound();
    }

    try {
      await bookDetails.remove();
    } catch(e) {
      this.logger.error(e as Error);
      return new HttpResponseBadRequest();
    }
    

    return new HttpResponseOK(bookDetails);
  }
}
