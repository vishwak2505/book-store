import { Context, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseServerError, HttpResponseSuccess, HttpResponseUnauthorized, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { LoggerService } from '../../services/logger';
import { Group, Permission } from '@foal/typeorm';
import { Book, Bookdetails, Bookrented } from '../../entities/bookstore';
import { bookStatus } from '../../entities/bookstore/bookrented.entity';
import { Credentials } from '../../services/apis';

const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  additionalProperties: false,
};

@UseSessions({
  cookie: true,
  required: true,
  user: (id: number) => User.findOneWithPermissionsBy({ id }),
})
export class AuthController {

    @dependency
    logger: LoggerService;

    @Post('/login')
    @ValidateBody(credentialsSchema)
    async login(ctx: Context<User|null>) {
      const email = ctx.request.body.email;
      const password = ctx.request.body.password;

      try{
        const user = await User.findOneBy({ email });

        if (!user) {
          throw new HttpResponseUnauthorized();
        }
    
        if (!(await verifyPassword(password, user.password))) {
          throw new HttpResponseUnauthorized();
        }

        ctx.session!.setUser(user);
        ctx.user = user;
    
        return new HttpResponseOK({
          id: user.id,
          name: user.name,
        });
      } catch (e) {
        this.logger.error(e as Error);
        return new HttpResponseBadRequest();
      }

    }
  
    @Post('/logout')
    async logout(ctx: Context) {
      await ctx.session!.destroy();
      return new HttpResponseOK();
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
        
        const credentials = new Credentials()
    
        const user = await credentials.signUpUser(userDetails);
        
        await user.save();
    
        ctx.session!.setUser(user);
        ctx.user = user;
    
        return new HttpResponseOK({
          id: user.id,
          name: user.name,
        });
      } catch (e){
        this.logger.error(e as Error);
        return new HttpResponseBadRequest(e);
      }
    }

    @Get('/profile')
    @UserRequired()
    async userProfile(ctx: Context<User>) {
      const user = ctx.user;
      const queryBuilder = Bookrented
      .createQueryBuilder('bookRented')
      .select(['bookRented.date_of_issue', 'bookRented.date_of_return'])
      .addSelect('bookDetails.book_name', 'book_name')
      .addSelect('bookDetails.genre', 'genre')
      .addSelect('book.Id', 'BookId')
      .leftJoin('bookRented.book', 'book')
      .leftJoin('book.book_details', 'bookDetails')
      .where('bookRented.user = :userId', { userId: user.id });

      const rentedBooks = await queryBuilder.getRawMany();
      const userProfile = {
        Name: user.name,
        AmountDue: user.amount_due,
        rentedBooks,
      }
      return new HttpResponseOK(userProfile);
    }

    @Post('/borrow/:bookName')
    @UserRequired()
    @ValidatePathParam('bookName', { type: 'string' })
    async borrowBook(ctx: Context<User>, { bookName }: { bookName: string }) {
      const bookDetails = await Bookdetails.findOne({ where: { book_name: bookName }});

      if (!bookDetails) {
        return new HttpResponseBadRequest('Book not found');
      }

      const book = await Book.findOneBy({ book_details: { id: bookDetails.id }, availability: true}) ;

      if (!book) {
        return new HttpResponseBadRequest('Book out of stock');
      }

      const bookRented = new Bookrented();
      bookRented.date_of_issue = new Date();
      bookRented.user = ctx.user;
      bookRented.book = book;
      bookRented.status = bookStatus.Active;
      
      await bookRented.save();

      ctx.user.amount_due += bookDetails.cost_per_day;

      ++bookDetails.no_of_copies_rented;

      await ctx.user.save();
      await bookDetails.save();
      
      book.availability = false;
      await book.save();
      return new HttpResponseOK(bookDetails);
    }

    @Post('/return/:bookId')
    @UserRequired()
    @ValidatePathParam('bookId', { type: 'number' })
    async returnBook(ctx: Context<User>, { bookId }: { bookId: number }) {

      try {
        const book = await Book.findOne({ where: { id: bookId }, relations: ['book_details'] });
        if (!book) {
          throw new HttpResponseBadRequest('Book not found');
        }

        const bookRented = await Bookrented
          .createQueryBuilder('bookRented')
          .leftJoinAndSelect('bookRented.book', 'book')
          .where('bookRented.book = :bookId', { bookId })
          .andWhere('bookRented.user = :userId', { userId: ctx.user.id })
          .andWhere('bookRented.status = :status', { status: bookStatus.Active })
          .getOne();

        if (!bookRented) {
          throw new HttpResponseBadRequest('Book not rented by the user');
        }
        
        const bookDetails = book.book_details;
        if (!bookDetails) {
          throw new Error('Book details not found');
        }

        bookRented.date_of_return = new Date();
        bookRented.status = bookStatus.Closed;
        await bookRented.save();

        bookDetails.no_of_copies_rented--;
        await bookDetails.save();

        book.availability = true;
        await book.save();
    
        ctx.user.amount_due -= bookDetails.cost_per_day;
        await ctx.user.save();
        
        return new HttpResponseOK(bookDetails);
      } catch (error) {
        this.logger.error(error as Error);
        return error as HttpResponse;
      }
    }
}