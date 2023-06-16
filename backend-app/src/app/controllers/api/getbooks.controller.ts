import { Context, Get, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseOK, PermissionRequired, UseSessions, UserRequired, dependency } from '@foal/core';
import { Bookdetails } from '../../entities/bookstore';
import { LoggerService } from '../../services/logger';
import { status } from '../../entities/bookstore/bookdetails.entity';
import { ErrorHandler } from '../../services';

export class GetbooksController {

  @dependency
  logger: ErrorHandler;

  @Get('/')
  async getAllBooks() {

    try {

      const books = await Bookdetails.find({
        select: ['id', 'book_name', 'genre', 'cost_per_day'],
        relations: ['pictures'],
        where: { bookStatus: status.Active, }
      });
  
      if (!books || books.length === 0) {
        throw new HttpResponseNotFound('No books found');
      }
  
      return new HttpResponseOK(books);

    } catch (e) {
      this.logger.returnError(e as Error);
      if (e instanceof Error || e instanceof HttpResponse) {
        return this.logger.returnError(e);
      } else {
        return new HttpResponseBadRequest(e);
      }
    }
  }

}