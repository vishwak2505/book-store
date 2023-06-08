import { Context, dependency, Get, hashPassword, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { LoggerService } from '../../../helper/logger';
import { Group, Permission } from '@foal/typeorm';
import { Book, Bookdetails, Bookrented } from '../../entities/bookstore';

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
      return new HttpResponseNoContent();
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
        const codeName = "user";
        const group = await Group.findOneBy({codeName});
        if (!group) throw new HttpResponseBadRequest();
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
            return;
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
        return new HttpResponseBadRequest();
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
      .where('bookRented.user = :userId', { userId: ctx.user.id })

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

      const book = await Book.findOneBy({ book_details: { id: bookDetails.id }, book_rented: undefined, availability: true}) ;

      if (!book) {
        return new HttpResponseBadRequest('Book is already rented');
      }

      const bookRented = new Bookrented();
      bookRented.date_of_issue = new Date();
      bookRented.user = ctx.user;
      bookRented.book = book;

      await bookRented.save();

      ctx.user.amount_due += bookDetails.cost_per_day;

      ++bookDetails.no_of_copies_rented;

      await ctx.user.save();
      await bookDetails.save();

      book.book_rented = bookRented;
      book.availability = false;
      await book.save();
      return new HttpResponseOK(ctx.user);
    }

    @Post('/return/:bookName')
    @UserRequired()
    @ValidatePathParam('bookName', { type: 'string' })
    async returnBook(ctx: Context<User>, { bookName }: { bookName: string }) {
      return new HttpResponseOK(ctx.user);
    }
}