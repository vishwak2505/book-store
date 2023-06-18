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

      const books = await Bookdetails.find({
        select: ['id', 'book_name', 'genre', 'cost_per_day', 'bookStatus'],
        relations: ['pictures'],
      });
  
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