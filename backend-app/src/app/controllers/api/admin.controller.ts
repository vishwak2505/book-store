import { Context, controller, Delete, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseSuccess, HttpResponseUnauthorized, PermissionRequired, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { BooksController } from './admin';
import { User } from '../../entities';
import { LoggerService } from '../../services/logger';
import { Book, Bookdetails } from '../../entities/bookstore';
import { Credentials } from '../../services/apis';
import { bookStatus } from '../../entities/bookstore/bookrented.entity';
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

export class AdminController {

    subControllers = [
        controller('/books', BooksController)
    ];

    @dependency
    logger: LoggerService;

    @dependency
    credentials : Credentials;
  
    @Post('/login')
    @ValidateBody(credentialsSchema)
    async login(ctx: Context<User|null>) {
      
      try{

        const admin = {
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: 'admin'
        }

        const user = await this.credentials.loginUser(admin);

        await user.save();
        
        const response = new HttpResponseOK();
        const token = await this.createJWT(user);
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
    @ValidateBody({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', maxLength: 255 },
        password: { type: 'string' },
        accessKey: {type: 'string'}
      },
      required: [ 'email', 'password' ],
      additionalProperties: false,
    })
    async signup(ctx: Context<User|null>) {
      try {

        if (ctx.request.body.accessKey != 'abcd') {
          throw new HttpResponseForbidden('Incorrect Access Key');
        } 

        const userDetails = {
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: 'admin',
        }
  
        const user = await this.credentials.signUpUser(userDetails);

        await user.save();
    
        const response = new HttpResponseOK();
        const token = await this.createJWT(user);
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

    @Get('/allUsers')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('view-user')
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

        if (!users) {
          throw new HttpResponseNotFound('No users found')
        }
        return new HttpResponseOK(users);
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    } 

    @Get('/:userId')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('view-user')
    @ValidatePathParam('userId', { type: 'number' })
    async viewUser(ctx: Context<User>, { userId }: { userId: number }) {
      try{
        const user = await User.findOneBy({id: userId});

        if (!user) {
          throw new HttpResponseNotFound('No user found with given ID');
        }
        return new HttpResponseOK(user);
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }

    @Delete('/:userId')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('remove-user')
    @ValidatePathParam('userId', { type: 'number' })
    async deleteUser(ctx: Context<User>, { userId }: { userId: number }) {
      try {
        const user = await User.findOne({ where: { id: userId }, relations: ['book_rented'] });
    
        if (!user) {
          throw new HttpResponseNotFound('User not found with given ID');
        }

        const books =  await Book.createQueryBuilder('book')
          .select('book.id', 'bookId')
          .addSelect('book_details.id', 'bookDetailsId')
          .innerJoin('book.book_rented', 'bookRented')
          .innerJoin('book.book_details', 'book_details')
          .where('bookRented.user = :userId', { userId })
          .andWhere('bookRented.status = :status', { status: bookStatus.Active })
          .getRawMany();

        if (books.length > 0) {
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
        }  
       
        await user.remove();
    
        return new HttpResponseOK(user);
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
