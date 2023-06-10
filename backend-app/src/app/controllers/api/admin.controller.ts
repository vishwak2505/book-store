import { Context, controller, Delete, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseUnauthorized, PermissionRequired, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { BooksController } from './admin';
import { User } from '../../entities';
import { LoggerService } from '../../services/logger';
import { Group, Permission } from '@foal/typeorm';
import { Book, Bookdetails, Bookrented } from '../../entities/bookstore';
import { Credentials } from '../../services/apis';
import { bookStatus } from '../../entities/bookstore/bookrented.entity';

const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' },
    adminPassword: {type: 'string' }
  },
  required: [ 'email', 'password' ],
  additionalProperties: false,
};

@UseSessions({
  cookie: true,
  required: true,
  user: (id: number) => User.findOneWithPermissionsBy({ id }),
})
export class AdminController {

    subControllers = [
        controller('/books', BooksController)
    ];

    @dependency
    logger: LoggerService;
  
    @Post('/login')
    @ValidateBody(credentialsSchema)
    async login(ctx: Context<User|null>) {

      const admin = {
        email: ctx.request.body.email,
        password: ctx.request.body.password
      }
      
      try{

        const user = await User.findOneBy({ email: admin.email });
        const group = await Group.findOneBy({ codeName: 'admin' });

        if (!user || !group) {
           throw new HttpResponseUnauthorized();
        }

        const userGroups = await User.createQueryBuilder('user')
          .leftJoinAndSelect('user.groups', 'groups')
          .where('user.id = :userId', { userId: user.id })
          .getOne();

        if (!userGroups || !userGroups.groups.some(g => g.id === group.id)) {
            throw new HttpResponseForbidden();
        }  
          
        if (!(await verifyPassword(admin.password, user.password))) {
          throw new HttpResponseForbidden();
        }

        ctx.session!.setUser(user);
        ctx.user = user;
        

        return new HttpResponseOK({
          token: ctx.session?.getToken(),
          id: user.id,
          name: user.name,
        });
      } catch (e) {
        this.logger.error(e as Error);
        return e as HttpResponse;
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

        if (ctx.request.body.adminPassword != 'abcd') {
          throw new HttpResponseForbidden();
        } 

        const userDetails = {
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: 'admin',
        }

        const credentials = new Credentials();
  
        const user = await credentials.signUpUser(userDetails);

        await user.save();
    
        ctx.session!.setUser(user);
        ctx.user = user;
    
        return new HttpResponseOK({
          token: ctx.session?.getToken(),
          id: user.id,
          name: user.name,
        });
      } catch (e){
        this.logger.error(e as Error);
        return e as HttpResponse;
      }
    }

    @Get('/allUsers')
    @UserRequired()
    async viewUsers () {
      try {
        let queryBuilder = User
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.groups', 'group')
          .where('group.codeName = :codeName', { codeName: 'customer'})
          .select([
            'user.id',
            'user.name',
            'user.email',
            'user.amount_due'
          ]);

        const users = await queryBuilder.getMany();
        return new HttpResponseOK(users);
      } catch (e) {
        this.logger.error(e as Error);
        return e as HttpResponse;
      }
    } 

    @Get('/:userId')
    @UserRequired()
    @ValidatePathParam('userId', { type: 'number' })
    async viewUser(ctx: Context<User>, { userId }: { userId: number }) {
      try{
        const user = await User.findOneBy({id: userId});

        if (!user) {
          throw new HttpResponseNotFound();
        }
        return new HttpResponseOK(user);
      } catch (e) {
        return new HttpResponseBadRequest();
      }
    }

    @Delete('/:userId')
    @UserRequired()
    @PermissionRequired('remove-user')
    @ValidatePathParam('userId', { type: 'number' })
    async deleteUser(ctx: Context<User>, { userId }: { userId: number }) {
      try {
        const user = await User.findOne({ where: { id: userId }, relations: ['book_rented'] });
    
        if (!user) {
          throw new HttpResponseNotFound('User not found');
        }
    
        try {
          const books =  await Book.createQueryBuilder('book')
          .select('book.id', 'bookId')
          .addSelect('book_details.id', 'bookDetailsId')
          .innerJoin('book.book_rented', 'bookRented')
          .innerJoin('book.book_details', 'book_details')
          .where('bookRented.user = :userId', { userId })
          .andWhere('bookRented.status = :status', { status: bookStatus.Active })
          .getRawMany();

          const bookIds = books.map(book => book.bookId);

          for (const book of books) {
            const bookDetails = await Bookdetails.findOne({ where: { id: book.bookDetailsId } });
            if (bookDetails) {
              bookDetails.no_of_copies_rented--;
              await bookDetails.save();
            }
          }
          
          await Book
          .createQueryBuilder()
          .update()
          .set({ availability: true })
          .whereInIds(bookIds)
          .execute();
        } catch (e) {
          console.log(e);
        }
       
        await user.remove();
    
        return new HttpResponseOK(user);
      } catch (e) {
        this.logger.error(e as Error);
        return new HttpResponseBadRequest();
      }
    }
}
