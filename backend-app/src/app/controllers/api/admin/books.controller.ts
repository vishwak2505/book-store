import { Context, Delete, Get, HttpResponse, HttpResponseBadRequest, HttpResponseCreated, HttpResponseNoContent, HttpResponseNotFound, HttpResponseNotImplemented, HttpResponseOK, Patch, PermissionRequired, Post, UseSessions, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam, dependency } from '@foal/core';
import { Book, Bookdetails } from '../../../entities/bookstore';
import { ParseAndValidateFiles } from '@foal/storage';
import { Picture } from '../../../entities/bookstore/picture.entity';
import { UploadedFile } from 'express-fileupload';
import { JWTRequired } from '@foal/jwt';
import { User } from '../../../entities';
import { status } from '../../../entities/bookstore/bookdetails.entity';
import * as fs from 'fs';
import csvParser = require('csv-parser');
import { ErrorHandler } from '../../../services';
import { LoggerService } from '../../../services/logger';
import { errors } from '../../../services/error-handler.service';
import { bookStatus } from '../../../entities/bookstore/bookrented.entity';

@JWTRequired({
  cookie: true,
  user: (id: number) => User.findOneWithPermissionsBy({ id })
})
export class BooksController {

  @dependency
  logger: LoggerService;

  @dependency
  errorHandler: ErrorHandler;

  @Get('/')
  @PermissionRequired('view-book')
  @ValidateQueryParam('bookName', { type: 'string', pattern: "^[a-zA-Z\\s]+$" }, { required: false })
  async getBook(ctx: Context) {

    try {
      const bookName = ctx.request.query.bookName;
      const limit = ctx.request.body.limit;
      const page = ctx.request.body.page;

      console.log(limit,page);

      if (bookName == '') {
        const books = await Bookdetails.find({
          select: ['id', 'book_name', 'genre', 'cost_per_day', 'total_no_of_copies', 'no_of_copies_rented','bookStatus'],
          relations: ['pictures', 'books'],
          order: {bookStatus: 'ASC'},
        });
  
        if (!books) {
          throw this.errorHandler.handleError(errors.notFound, 'No books found');
        }
        return new HttpResponseOK(books);
      }

      const book = await Bookdetails.findOne({where: { book_name: bookName }, relations: ['pictures', 'books']});

      if (!book) {
        throw this.errorHandler.handleError(errors.notFound, 'No book found');
      }

      return new HttpResponseOK(book);
    } catch (response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    }
  }

  @Post('/')
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
      bookDetails.bookStatus = status.Active;

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
        book.status = bookStatus.Active;
        await book.save();
      }

      return new HttpResponseCreated(bookDetails);
    } catch (e) {
      this.logger.error(`${e}`);
      return new HttpResponseBadRequest();
    }
  }

  @Post('/addBooksFromCSV')
  @UserRequired()
  @PermissionRequired('add-book')
  @ParseAndValidateFiles({
    file: { required: true, saveTo: 'uploads', multiple: false }
  })
  async addBooksFromCSV(ctx: Context<Bookdetails & { file: { csvFile?: UploadedFile } }>) {
    try {
      const csvFile = ctx.files.get('file')[0];
      const csvFilePath = csvFile.path;
  
      if (csvFile.mimeType != 'text/csv') {
        throw this.errorHandler.handleError(errors.badRequest, 'File type is not csv');
      }
  
      const jsonArray: any[] = await new Promise((resolve, reject) => {
        const results: any[] = [];
  
        fs.createReadStream(`assets/${csvFilePath}`)
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
      
      let books: string[] = [];

      for (const row of jsonArray) {
        const book = await Bookdetails.findOne({ where: {book_name: row.bookName }});
        if (book) {
          books.push(row.bookName);
          continue;
        }

        const bookDetails = new Bookdetails();
        bookDetails.book_name = row.bookName;
        bookDetails.genre = row.genre;
        bookDetails.total_no_of_copies = row.totalNoOfCopies;
        bookDetails.no_of_copies_rented = 0;
        bookDetails.cost_per_day = row.costPerDay;
        bookDetails.bookStatus = status.Active;
  
        await bookDetails.save();
  
        for (let i = 0; i < row.totalNoOfCopies; i++) {
          const book = new Book();
          book.availability = true;
          book.book_details = bookDetails;
          book.status = bookStatus.Active;
          await book.save();
        }
      }
      
      if (books.length > 0){
        return new HttpResponseCreated(`Books added successfully, Duplicate Entries: ${books}`);
      }
      return new HttpResponseCreated('Books added successfully');
    } catch (response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    }
  }

  @Patch('/updateBookDetail')
  @UserRequired()
  @PermissionRequired('update-book') 
  @ParseAndValidateFiles(
    {
      pictures: { required: false, saveTo: 'images/books', multiple: true }
    },
    {
      type: 'object',
      properties: {
        bookId: { type: 'number' },
        bookName: { type: 'string', maxLength: 255 },
        genre: { type: 'string', maxLength: 255 },
        totalNoOfCopies: { type: 'number' },
        costPerDay: { type: 'number' }
      },
      required: ['bookId'],
      additionalProperties: false,
    }
  )
  async updateBook(ctx: Context<Bookdetails> & { files: { pictures?: UploadedFile[] } }) {
    try {
      const bookId = ctx.request.body.bookId;
      const bookDetails = await Bookdetails.findOneBy({ id: bookId });

      if (!bookDetails) {
        throw this.errorHandler.handleError(errors.notFound, 'Book not found');
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
              book.status = bookStatus.Active;
              await book.save();
            }
          } else {
            const deleteBook = extraBooks * -1;
            for (let i = 0; i < deleteBook; i++) {
              const book = await Book.findOne({where: {book_details: {id: bookId}, availability: true}});
              if (!book) {
                throw this.errorHandler.handleError(errors.notFound, 'Book Not Found');
              }
              await book.remove();
            }
          }

        } else {
          throw this.errorHandler.handleError(errors.notImplemented, 'Total no of copies is less than no of copies rented');
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

      await bookDetails.save();

      return new HttpResponseOK(bookDetails);
    } catch(response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    }
  }

  // @Patch('/updateGenre')
  // @UserRequired()
  // @PermissionRequired('update-book') 
  // @ValidatePathParam('oldGenre', { type: 'string' })
  // async updateGenre() {

  // }

  @Delete('/deleteById/:bookId')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidatePathParam('bookId', { type: 'number' })
  async deleteBook(ctx: Context ,{ bookId }: { bookId: number }) {

    try {

      const book = await Book.findOne({ where: { id: bookId }, relations: ['book_details'] });

      if (!book) {
        throw this.errorHandler.handleError(errors.notFound, 'Book not found');
      }
      
      if (book.availability == false) {
        throw this.errorHandler.handleError(errors.notImplemented, 'Book is rented by a customer')
      }

      book.status = bookStatus.Closed;

      await book.save();

      book.book_details.total_no_of_copies--;
      await book.book_details.save();

      return new HttpResponseOK(book.book_details);
    } catch(response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    } 
  }

  @Delete('/deleteByName/')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidateQueryParam('bookName', { type: 'string' })
  async deleteBookDetailsByName(ctx: Context) {

    try {
      const bookName = ctx.request.query.bookName;

      const bookDetails = await Bookdetails.findOne({ where: { book_name: bookName }});

      if (!bookDetails) {
        throw this.errorHandler.handleError(errors.notFound, 'Book not found');
      }

      if (bookDetails.no_of_copies_rented != 0) {
        await Book 
        .createQueryBuilder('Book')
        .update()
        .set({ availability: false })
        .where('book.bookDetailsId = :bookDetailsId', { bookDetailsId: bookDetails.id })
        .execute();
      }  

      bookDetails.bookStatus = status.Closed;
      await bookDetails.save();

      return new HttpResponseOK(bookDetails);
    } catch(response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    } 
  }

  @Delete('/deleteByGenre/')
  @UserRequired()
  @PermissionRequired('remove-book')
  @ValidateQueryParam('bookGenre', { type: 'string' })
  async deleteBookDetailsByGenre(ctx: Context) {

    try {
      const bookGenre = ctx.request.query.bookGenre;

      const bookDetails = await Bookdetails.find({ where: { genre: bookGenre }});

      if (bookDetails.length == 0) {
        throw this.errorHandler.handleError(errors.notFound, 'No books found');
      }

      const booksRented: Bookdetails[] = [];
      const booksRemoved: Bookdetails[] = [];
      const booksClosed: Bookdetails[] = [];

      for(const book of bookDetails) {
        if(book.no_of_copies_rented != 0){
          booksRented.push(book);
          book.bookStatus = status.Closed;
          await book.save();
          continue;
        }

        if(book.bookStatus == status.Closed) {
          booksClosed.push(book);
          continue;
        }
        
        await Book 
          .createQueryBuilder('Book')
          .update()
          .set({ availability: false })
          .where('book.bookDetailsId = :bookDetailsId', { bookDetailsId: book.id })
          .execute();

        book.bookStatus = status.Closed;
        await book.save();
        booksRemoved.push(book);
      }

      return new HttpResponseOK(`Books Removed: ${JSON.stringify(booksRemoved, null, 2)} \nBooks Rented By Customers: ${JSON.stringify(booksRented, null, 2)} \nClosed Books: ${JSON.stringify(booksClosed, null, 2)}`);
    } catch(response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    } 
  }

  @Patch('/reactivateBook')
  @UserRequired()
  @PermissionRequired('update-book')
  @ValidateQueryParam('bookName', { type: 'string' })
  async reactivateBook(ctx: Context) {
    try {
      const bookName = ctx.request.query.bookName;

      const bookDetails = await Bookdetails.findOne({ where: { book_name: bookName }});

      if (!bookDetails) {
        throw this.errorHandler.handleError(errors.notFound, 'Book not found');
      }

      await Book 
          .createQueryBuilder('Book')
          .update()
          .set({ availability: true })
          .where('book.bookDetailsId = :bookDetailsId', { bookDetailsId: bookDetails.id })
          .execute();

        bookDetails.bookStatus = status.Active;
        await bookDetails.save();

        return new HttpResponseOK(bookDetails);
    } catch(response) {
      if (response instanceof HttpResponse)
        return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    } 
  }
}
