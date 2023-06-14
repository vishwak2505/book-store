import { Context, Get, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseOK, PermissionRequired, UseSessions, UserRequired, dependency } from '@foal/core';
import { Bookdetails } from '../../entities/bookstore';
import { LoggerService } from '../../services/logger';
export class GetbooksController {

  @dependency
  logger: LoggerService

  @Get('/allBooks')
  async getAllBooks() {

    try {

      const books = await Bookdetails.find({
        select: ['id', 'book_name', 'genre', 'cost_per_day'],
        relations: ['pictures'],
      });
  
      if (!books || books.length === 0) {
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

}