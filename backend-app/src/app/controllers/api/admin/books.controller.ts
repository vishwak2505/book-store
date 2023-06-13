import { Context, Delete, Get, HttpResponse, HttpResponseBadRequest, HttpResponseCreated, HttpResponseNoContent, HttpResponseNotFound, HttpResponseNotImplemented, HttpResponseOK, Patch, PermissionRequired, Post, UseSessions, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam, dependency } from '@foal/core';
import { LoggerService } from '../../../services/logger';
import { Book, Bookdetails } from '../../../entities/bookstore';
import { Bookrented, bookStatus } from '../../../entities/bookstore/bookrented.entity';
import { ParseAndValidateFiles } from '@foal/storage';
import { Picture } from '../../../entities/bookstore/picture.entity';
import { UploadedFile } from 'express-fileupload';
import { JWTRequired } from '@foal/jwt';
import { User } from '../../../entities';

@JWTRequired({
  cookie: true,
  user: (id: number) => User.findOneWithPermissionsBy({ id })
})
export class BooksController {

  @dependency
  logger: LoggerService;

  @Get('/allBooks')
  @UserRequired()
  @PermissionRequired('view-book')
  async getAllBooks() {

    try {
      let queryBuilder = Bookdetails
      .createQueryBuilder('book')
      .select([
        'book.book_name',
        'book.genre',
        'book.total_no_of_copies',
        'book.no_of_copies_rented',
        'book.cost_per_day',
      ]);

      const books = await queryBuilder.getMany();

      if (!books) {
        throw new HttpResponseNotFound('No books found');
      }
      return new HttpResponseOK(books);
    } catch (e) {
      this.logger.error(e as Error);
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

  @Get('/:bookName')
  @PermissionRequired('view-book')
  @UserRequired()
  @ValidatePathParam('bookName', { type: 'string' })
  async getBook(ctx: Context, { bookName }: { bookName: string }) {

    try {
      const book = await Bookdetails.findOne({where: { book_name: bookName }});

      if (!book) {
        throw new HttpResponseNotFound('No Book Found');
      }

      return new HttpResponseOK(book);
    } catch (e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

  @Get('/rentedBooks/allBooks')
  @UserRequired()
  @PermissionRequired('view-book')
  async getRentedBooks() {

    try {
      const rentedBooks = await Bookrented.createQueryBuilder('bookRented')
        .leftJoin('bookRented.book', 'book')
        .leftJoin('book.book_details', 'bookDetails')
        .leftJoin('bookRented.user', 'user')
        .select([
          'bookRented.status',
          'bookRented.id',
          'bookRented.date_of_issue',
          'bookRented.date_of_return',
          'book.id',
          'bookDetails.book_name',
          'bookDetails.genre',
          'bookDetails.cost_per_day',
          'user.id',
          'user.name',
          'user.email'
        ])
        .orderBy('bookRented.status')
        .getRawMany();
      
      if (!rentedBooks) {
        throw new HttpResponseNotFound('No Rented Books Found')
      }  

      return new HttpResponseOK(rentedBooks);
    } catch (e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

  @Get('/rentedBooks/:rentedBookId')
  @UserRequired()
  @PermissionRequired('view-book')
  @ValidatePathParam('rentedBookId', { type: 'number' })
  async getRentedBook(ctx: Context, { rentedBookId }: { rentedBookId: number }) {

    try {
      const rentedBooks = await Bookrented.createQueryBuilder('bookRented')
        .leftJoin('bookRented.book', 'book')
        .leftJoin('book.book_details', 'bookDetails')
        .leftJoin('bookRented.user', 'user')
        .select([
          'bookRented.status',
          'bookRented.id',
          'bookRented.date_of_issue',
          'bookRented.date_of_return',
          'book.id',
          'bookDetails.book_name',
          'bookDetails.genre',
          'bookDetails.cost_per_day',
          'user.id',
          'user.name',
          'user.email'
        ])
        .where('bookRented.id = :id', { id: rentedBookId })
        .getRawMany();

      if (!rentedBooks) {
        throw new HttpResponseNotFound('No Rented Books Found')
      }  
  
      return new HttpResponseOK(rentedBooks);
    } catch (e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

  @Post('/add')
  @UserRequired()
  @PermissionRequired('add-book')
  @ParseAndValidateFiles(
    {
      pictures: { required: false, saveTo: 'images/books', multiple: true }
    },
    {
      type: 'object',
      properties: {
        bookName: { type: 'string', maxLength: 255 },
        genre: { type: 'string', maxLength: 255 },
        totalNoOfCopies: { type: 'number' },
        costPerDay: { type: 'number' }
      },
      required: ['bookName', 'genre', 'totalNoOfCopies', 'costPerDay'],
      additionalProperties: false,
    }
  )
  async addbook(ctx: Context<Bookdetails> & { files: { pictures?: UploadedFile[] } }) {
    try {
      const bookDetails = new Bookdetails();
      bookDetails.book_name = ctx.request.body.bookName;
      bookDetails.genre = ctx.request.body.genre;
      bookDetails.total_no_of_copies = ctx.request.body.totalNoOfCopies;
      bookDetails.no_of_copies_rented = 0;
      bookDetails.cost_per_day = ctx.request.body.costPerDay;

      await bookDetails.save();        

      if (ctx.files.getAll()) {
        const pictures = ctx.files.getAll();

        const savedpictures = await Promise.all(
          pictures.map(async (picture) => {

            const pictureEntity = new Picture();
            pictureEntity.fileName = picture.path;
            pictureEntity.bookdetails = bookDetails;
            await pictureEntity.save();

            return pictureEntity;
          })
        );
      }

      for (let i = 0; i < ctx.request.body.totalNoOfCopies; i++) {
        const book = new Book();
        book.availability = true;
        book.book_details = bookDetails;
        await book.save();
      }

      return new HttpResponseCreated(bookDetails);
    } catch (e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }


  @Patch('/update')
  @UserRequired()
  @PermissionRequired('update-book') 
  @ValidateBody({
    type: 'object',
    properties: {
      bookId: { type: 'number' },
      bookName: { type: 'string', maxLength: 255 },
      genre: { type: 'string', maxLength: 255 },
      totalNoOfCopies: { type: 'number' },
      costPerDay: { type: 'number' }
    },
    required: [ 'bookId' ],
    additionalProperties: false,
  })
  async updateBook(ctx: Context<Bookdetails>) {
    try {
      const bookId = ctx.request.body.bookId;
      const bookDetails = await Bookdetails.findOneBy({ id: bookId });

      if (!bookDetails) {
        throw new HttpResponseNotFound('Book Not Found');
      }
      
      const bookName = ctx.request.body.bookName;
      const genre = ctx.request.body.genre;
      const totalNoOfCopies = ctx.request.body.totalNoOfCopies;
      const costPerDay = ctx.request.body.costPerDay;

      if ( totalNoOfCopies ) {
        if (totalNoOfCopies >= bookDetails.no_of_copies_rented && totalNoOfCopies != bookDetails.total_no_of_copies) {
          const extraBooks = totalNoOfCopies - bookDetails.total_no_of_copies;
          bookDetails.total_no_of_copies = totalNoOfCopies;
          
          if (extraBooks > 0) {
            for (let i = 0; i < extraBooks; i++) {
              const book = new Book();
              book.availability = true;
              book.book_details = bookDetails;
              await book.save();
            }
          } else {
            const deleteBook = extraBooks * -1;
            for (let i = 0; i < deleteBook; i++) {
              const book = await Book.findOne({where: {book_details: {id: bookId}, availability: true}});
              if (!book) {
                throw new HttpResponseNotFound('Book Not Found');
              }
              await book.remove();
            }
          }

        } else {
          throw new HttpResponseNotImplemented('Total no of copies is less than no of copies rented');
        }
      }
      
      if (bookName != '') {
        bookDetails.book_name = bookName;
      }

      if (genre != '') {
        bookDetails.genre = genre;
      }

      if (costPerDay) {
        bookDetails.cost_per_day = costPerDay;
      }

      await bookDetails.save();

      return new HttpResponseOK(bookDetails);
    } catch(e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

  @Delete('/delete/:bookId')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidatePathParam('bookId', { type: 'number' })
  async deleteBook(ctx: Context ,{ bookId }: { bookId: number }) {

    try {

      const book = await Book.findOne({ where: { id: bookId }, relations: ['book_details'] });

      if (!book) {
        throw new HttpResponseNotFound('No Book Found');
      }

      const bookRented = await Bookrented.findOneBy({ book :{ id: bookId }});
      
      if (bookRented?.status == bookStatus.Active) {
        throw new HttpResponseBadRequest('Book is rented by a customer');
      }

      await book.remove();

      book.book_details.total_no_of_copies--;
      await book.book_details.save();

      return new HttpResponseOK(book.book_details);
    } catch(e) {
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    } 
  }
}
