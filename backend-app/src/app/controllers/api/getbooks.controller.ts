import { Context, Get, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseOK, PermissionRequired, UseSessions, UserRequired, dependency } from '@foal/core';
import { Bookdetails, Picture } from '../../entities/bookstore';
import { LoggerService } from '../../services/logger';
import { status } from '../../entities/bookstore/bookdetails.entity';
import { ErrorHandler } from '../../services';
import { errors } from '../../services/error-handler.service';

export class GetbooksController {

  @dependency
  logger: LoggerService;

  @dependency
  errorHandler: ErrorHandler;

  @Get('/')
  async getAllBooks() {

    try {

      const books = await Bookdetails
        .createQueryBuilder('bookdetails')
        .select([
          'bookdetails.id AS id',
          'bookdetails.book_name AS bookName',
          'bookdetails.genre AS genre',
          'bookdetails.cost_per_day AS costPerDay',
          'bookdetails.bookStatus AS bookStatus',
          '(bookdetails.total_no_of_copies - bookdetails.no_of_copies_rented) AS noOfBooksAvailable',
        ])
        .orderBy('bookdetails.bookStatus')
        .getRawMany();
        
      const bookIds = books.map(book => book.id);
      const pictures = await Picture
        .createQueryBuilder('picture')
        .select(['picture.fileName AS fileName', 'picture.bookdetailsId'])
        .where('picture.bookdetailsId IN (:...bookIds)', { bookIds })
        .getRawMany();

      const booksWithPictures = books.map(book => {
        const matchingPictures = pictures.filter(picture => picture.bookdetailsId === book.id);
        const fileNames = matchingPictures.map(picture => picture.fileName);
        return { ...book, pictures: fileNames };
      });

  
      return new HttpResponseOK(booksWithPictures);

    } catch (response) {
      if (response instanceof HttpResponse)
          return response;
      
      this.logger.error(`${response}`);
      return new HttpResponseBadRequest();
    }
  }

}