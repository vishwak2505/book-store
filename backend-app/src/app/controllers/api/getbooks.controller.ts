import { Context, Get, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseOK, PermissionRequired, UseSessions, UserRequired, dependency } from '@foal/core';
import { Bookdetails } from '../../entities/bookstore';
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

      // const books = await Bookdetails.find({
      //   select: ['id', 'book_name', 'genre', 'cost_per_day', 'bookStatus'],
      //   relations: ['pictures'],
      // });

      const books = await Bookdetails
        .createQueryBuilder('bookdetails')
        .select([
          'bookdetails.id',
          'bookdetails.book_name',
          'bookdetails.genre',
          'bookdetails.cost_per_day',
          'bookdetails.bookStatus',
          '(bookdetails.total_no_of_copies - bookdetails.no_of_copies_rented) AS no_of_books_available',
        ])
        .leftJoin('bookdetails.pictures', 'picture')
        .groupBy('bookdetails.id')
        .orderBy('bookdetails.bookStatus')
        .getRawMany();
  
      if (!books || books.length === 0) {
        throw this.errorHandler.returnError(errors.notFound, 'No books found');
      }
  
      return new HttpResponseOK(books);

    } catch (response) {
      if (response instanceof HttpResponse)
          return response;
      
      this.logger.error(`${response}`);
    }
  }

}