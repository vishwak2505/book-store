import { Context, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseServerError, HttpResponseSuccess, HttpResponseUnauthorized, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { LoggerService } from '../../services/logger';
import { Book, Bookdetails, Bookrented } from '../../entities/bookstore';
import { bookStatus } from '../../entities/bookstore/bookrented.entity';
import { Credentials } from '../../services/apis';
import { getSecretOrPrivateKey, JWTRequired, removeAuthCookie, setAuthCookie } from '@foal/jwt';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';

const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  additionalProperties: false,
};


export class AuthController {

    @dependency
    logger: LoggerService;

    @dependency
    credentials: Credentials

    @Post('/login')
    @ValidateBody(credentialsSchema)
    async login(ctx: Context<User|null>) {
      
      try{
        const userDetails = {
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: 'customer'
        }

        const user = await this.credentials.loginUser(userDetails);
    
        await user.save();

        const response = new HttpResponseOK();
        const token = await this.createJWT(user);

        if (!token) {
          return new HttpResponseBadRequest('No token genereted');
        }

        setAuthCookie(response, token);

        return response;
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }
    
    @Post('/signup')
    @ValidateBody(credentialsSchema)
    async signup(ctx: Context<User|null>) {
      try {

        const userDetails = {
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: 'customer'
        }
            
        const user = await this.credentials.signUpUser(userDetails);
        
        await user.save();
        
        const response = new HttpResponseOK();
        const token = await this.createJWT(user);

        if (!token) {
          return new HttpResponseBadRequest('No token genereted');
        }
        
        setAuthCookie(response, token);

        return response;
      } catch (e){
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }

    @Post('/logout')
    async logout(ctx: Context) {
      const response = new HttpResponseOK();
      removeAuthCookie(response);
      return response;
    }

    @Post('/borrow/:bookName')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneBy({ id })
    })
    @UserRequired()
    @ValidatePathParam('bookName', { type: 'string' })
    async borrowBook(ctx: Context<User>, { bookName }: { bookName: string }) {

      try {
        const bookDetails = await Bookdetails.findOne({ where: { book_name: bookName }});

        if (!bookDetails) {
          throw new HttpResponseNotFound('Book not found');
        }

        const book = await Book.findOneBy({ book_details: { id: bookDetails.id }, availability: true}) ;

        if (!book) {
          throw new HttpResponseNotFound('Book out of stock');
        }

        const bookRented = new Bookrented();
        bookRented.date_of_issue = new Date();
        bookRented.user = ctx.user;
        bookRented.book = book;
        bookRented.status = bookStatus.Active;
        await bookRented.save();

        book.availability = false;
        await book.save();

        ++bookDetails.no_of_copies_rented;
        await bookDetails.save();
        
        return new HttpResponseOK(bookDetails);
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }

    @Post('/return/:bookId')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneBy({ id })
    })
    @UserRequired()
    @ValidatePathParam('bookId', { type: 'number' })
    async returnBook(ctx: Context<User>, { bookId }: { bookId: number }) {

      try {
        const book = await Book.findOne({ where: { id: bookId }, relations: ['book_details'] });

        if (!book) {
          throw new HttpResponseNotFound('Book not found');
        }

        const bookRented = await Bookrented
          .createQueryBuilder('bookRented')
          .leftJoinAndSelect('bookRented.book', 'book')
          .where('bookRented.book = :bookId', { bookId })
          .andWhere('bookRented.user = :userId', { userId: ctx.user.id })
          .andWhere('bookRented.status = :status', { status: bookStatus.Active })
          .getOne();

        if (!bookRented) {
          throw new HttpResponseNotFound('Book not rented by the user');
        }
        
        const bookDetails = book.book_details;
        
        if (!bookDetails) {
          throw new HttpResponseNotFound('Book details not found');
        }

        bookRented.date_of_return = new Date();
        bookRented.status = bookStatus.Closed;
        await bookRented.save();

        bookDetails.no_of_copies_rented--;
        await bookDetails.save();

        book.availability = true;
        await book.save();

        const dateOfIssue = bookRented.date_of_issue;
        const dateOfReturn = bookRented.date_of_return;

        dateOfIssue.setHours(0, 0, 0, 0);
        dateOfReturn.setHours(0, 0, 0, 0);
        const timeDifference = dateOfReturn.getTime() - dateOfIssue.getTime();
        const daysDifference = Math.ceil(timeDifference / (24 * 60 * 60 * 1000)) + 1;
    
        ctx.user.amount_due += ( bookDetails.cost_per_day *  daysDifference);
        await ctx.user.save();
        
        return new HttpResponseOK(bookDetails);
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }

    private async createJWT(user: User): Promise<string> {
      const payload = {
        email: user.email,
        id: user.id,
      };
      
      return promisify(sign as any)(
        payload,
        getSecretOrPrivateKey(),
        { subject: user.id.toString() }
      );
    }
}