import { Context, dependency, Get, hashPassword, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseServerError, HttpResponseSuccess, HttpResponseUnauthorized, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { LoggerService } from '../../../helper/logger';
import { Group, Permission } from '@foal/typeorm';
import { Book, Bookdetails, Bookrented } from '../../entities/bookstore';
import { bookStatus } from '../../entities/bookstore/bookrented.entity';

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
        const email = ctx.request.body.email;
        const password = ctx.request.body.password;
    
        const user = new User();
        user.email = email;
        user.amount_due = 0;
        user.name = 'Unknown';
        user.password = await hashPassword(password);
        user.groups = [];
        user.userPermissions = [];
        const codeName = "customer";
        const group = await Group.findOneBy({codeName});
        if (!group) {
          throw new HttpResponseBadRequest('No group found');
        }
        user.groups.push(group);

        const queryBuilder = Group.createQueryBuilder('group')
          .leftJoinAndSelect('group.permissions', 'permission')
          .where('group.codeName = :groupName', { groupName: codeName })
          .select('permission.codeName', 'codeName');

        const permissions = await queryBuilder.getMany();  
        
        for (const perm of permissions) {
          const permission = await Permission.findOneBy({ codeName: perm.codeName });
          if (!permission) {
            this.logger.warn(`No permission with the code name "${codeName}" was found.`);
            throw new HttpResponseBadRequest('No permission found');
          }
          user.userPermissions.push(permission);
        }
        
        await user.save();
    
        ctx.session!.setUser(user);
        ctx.user = user;
    
        return new HttpResponseOK({
          id: user.id,
          name: user.name,
        });
      } catch (e){
        this.logger.error(e as Error);
        return e as Error;
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

    @Post('/return/:bookName')
    @UserRequired()
    @ValidatePathParam('bookName', { type: 'string' })
    async returnBook(ctx: Context<User>, { bookName }: { bookName: string }) {

      try {
        const book = await Book
          .createQueryBuilder('book')
          .leftJoinAndSelect('book.book_details', 'book_details')
          .leftJoinAndSelect('book.book_rented', 'book_rented')
          .where('book_details.book_name = :bookName', { bookName })
          .andWhere('book_rented.userId = :userId', { userId: ctx.user.id })
          .andWhere('book_rented.status = :status', {status: bookStatus.Active})
          .getOne();

        if (!book) {
          return new HttpResponseNotFound(`Book with name ${bookName} not found.`);
        }

        const bookRented = await Bookrented
          .createQueryBuilder('bookRented')
          .leftJoinAndSelect('bookRented.book', 'book')
          .leftJoinAndSelect('book.book_details', 'book_details')
          .where('bookRented.status = :status', {status: bookStatus.Active})
          .andWhere('book_details.book_name = :bookName', { bookName })
          .getOne();

        if (!bookRented) {
          return new HttpResponseBadRequest(`Book with name ${bookName} is not currently borrowed.`);
        }

        book.availability = true;

        bookRented.date_of_return = new Date();
        bookRented.status = bookStatus.Closed;

        if (book.book_details) {
          book.book_details.no_of_copies_rented--;
          await book.book_details.save();
        }

        ctx.user.amount_due -= book.book_details.cost_per_day;

        await ctx.user.save();
        await book.save();
        await bookRented.save();

        return new HttpResponseOK(`Book with name ${bookName} has been returned successfully.`);
      } catch (error) {
        this.logger.error(error as Error);
        return new HttpResponseBadRequest('An error occurred while returning the borrowed book.');
      }
    }
}