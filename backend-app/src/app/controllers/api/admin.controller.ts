import { ApiUseTag, Context, controller, Delete, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseSuccess, HttpResponseUnauthorized, Patch, PermissionRequired, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { BooksController } from './admin';
import { User } from '../../entities';
import { Book, Bookdetails } from '../../entities/bookstore';
import { Credentials } from '../../services/apis';
import { Bookrented, bookStatus } from '../../entities/bookstore/bookrented.entity';
import { getSecretOrPrivateKey, JWTRequired, removeAuthCookie, setAuthCookie } from '@foal/jwt';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';
import { Disk } from '@foal/storage';
import { createObjectCsvStringifier } from 'csv-writer';
import { userStatus } from '../../entities/user.entity';
import { ErrorHandler } from '../../services';
import { LoggerService } from '../../services/logger';
import { errors } from '../../services/error-handler.service';

const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  additionalProperties: false,
};

@ApiUseTag('admin')
export class AdminController {

    subControllers = [
        controller('/books', BooksController)
    ];

    @dependency
    logger: LoggerService;

    @dependency
    errorHandler: ErrorHandler;

    @dependency
    credentials : Credentials;

    @dependency
    disk: Disk;
  
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

        if (!token) {
          throw this.errorHandler.handleError(errors.notImplemented, 'No token generated');
        }
        setAuthCookie(response, token);

        return response;
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
      }

    }

    @Post('/signup')
    @ValidateBody({
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password: { type: 'string' },
        accessKey: {type: 'string'}
      },
      required: [ 'name', 'email', 'password' ],
      additionalProperties: false,
    })
    async signup(ctx: Context<User|null>) {
      try {

        if (ctx.request.body.accessKey != 'abcd') {
          throw this.errorHandler.handleError(errors.forbidden, 'Incorrect Access Key');
        } 

        const userDetails = {
          name: ctx.request.body.name,
          email: ctx.request.body.email,
          password: ctx.request.body.password,
          group: ['admin', 'customer'],
        }
  
        const user = await this.credentials.signUpUser(userDetails);
        console.log(user);
        await user.save();
    
        const response = new HttpResponseOK();
        const token = await this.createJWT(user);

        if (!token) {
          throw this.errorHandler.handleError(errors.notImplemented, 'No token generated');
        }

        setAuthCookie(response, token);

        return response;
      } catch (response){
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
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
    async viewUsers(ctx: Context) {
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
          throw this.errorHandler.handleError(errors.notFound, 'No users found');
        }

        return new HttpResponseOK(users);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
      }
    }

    @Get('/downloadUsersList')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('view-user')
    async downloadUsers(ctx: Context) {
      try {
        let queryBuilder = User
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.groups', 'group')
          .where('group.codeName = :codeName', { codeName: 'customer'})
          .select([
            'user.id',
            'user.name',
            'user.email',
            'user.amount_due',
            'user.status'
          ]);

        const users = await queryBuilder.getMany();

        if (!users) {
          throw this.errorHandler.handleError(errors.notFound, 'No users found');
        }

        const csvStringifier = createObjectCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'amount_due', title: 'Amount Due' },
            { id: 'status', title: 'Status' }
          ]
        });

        const csvData = csvStringifier.stringifyRecords(users);

        const response = new HttpResponseOK();
        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        response.body = csvData;

        return response;
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
      }
    }

    @Get('/rentedBooks')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('view-book')
    async getRentedBooks() {

      try {
        const rentedBooks = await Bookrented.createQueryBuilder('bookRented')
          .leftJoin('bookRented.book', 'book')
          .leftJoin('book.book_details', 'bookDetails')
          .leftJoin('bookRented.user', 'user')
          .select([
            'bookRented.status',
            'bookRented.id',
            'bookRented.date_of_issue',
            'bookRented.date_of_return',
            'book.id',
            'bookDetails.book_name',
            'bookDetails.genre',
            'bookDetails.cost_per_day',
            'user.id',
            'user.name',
            'user.email'
          ])
          .orderBy('bookRented.status')
          .getRawMany();
        
        if (!rentedBooks) {
          throw this.errorHandler.handleError(errors.notFound, 'No Rented Books Found')
        }  

        return new HttpResponseOK(rentedBooks);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
        return new HttpResponseBadRequest();
      }
    }

    @Get('/rentedBooks/:rentedBookId')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('view-book')
    @ValidatePathParam('rentedBookId', { type: 'number' })
    async getRentedBook(ctx: Context, { rentedBookId }: { rentedBookId: number }) {

      try {
        const rentedBooks = await Bookrented.createQueryBuilder('bookRented')
          .leftJoin('bookRented.book', 'book')
          .leftJoin('book.book_details', 'bookDetails')
          .leftJoin('bookRented.user', 'user')
          .select([
            'bookRented.status',
            'bookRented.id',
            'bookRented.date_of_issue',
            'bookRented.date_of_return',
            'book.id',
            'bookDetails.book_name',
            'bookDetails.genre',
            'bookDetails.cost_per_day',
            'user.id',
            'user.name',
            'user.email'
          ])
          .where('bookRented.id = :id', { id: rentedBookId })
          .getRawMany();

        if (!rentedBooks) {
          throw this.errorHandler.handleError(errors.notFound, 'No Rented Books Found')
        }  
    
        return new HttpResponseOK(rentedBooks);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
        return new HttpResponseBadRequest();
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
          throw this.errorHandler.handleError(errors.notFound, 'No user found with given ID');
        }
        return new HttpResponseOK(user);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
        return new HttpResponseBadRequest();
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
    
        if (!user || user.status == userStatus.Inactive) {
          throw this.errorHandler.handleError(errors.notFound, 'User not found with given ID');
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
          let cost = 0;

          for (const book of books) {
            const bookDetails = await Bookdetails.findOne({ where: { id: book.bookDetailsId } });
            if (bookDetails) {
              bookDetails.no_of_copies_rented--;
              cost += bookDetails.cost_per_day;
              await bookDetails.save();
            }
          }

          user.amount_due += cost;
        
          await Book
            .createQueryBuilder()
            .update()
            .set({ availability: true })
            .whereInIds(bookIds)
            .execute();

          await Bookrented
            .createQueryBuilder()
            .update()
            .set({ 
              date_of_return: new Date(),
              status: bookStatus.Closed
            })
            .where('userId = :userId', { userId: user.id })
            .execute();  
        }  
        
        user.status = userStatus.Inactive;

        await user.save();
    
        return new HttpResponseOK(user);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
        return new HttpResponseBadRequest();
      }
    }

    @Patch('/:userId')
    @JWTRequired({
      cookie: true,
      user: (id: number) => User.findOneWithPermissionsBy({ id })
    })
    @UserRequired()
    @PermissionRequired('update-user')
    @ValidatePathParam('userId', { type: 'number' })
    async reactivateUser(ctx: Context, { userId }: { userId: number }) {
      try {
        const user = await User.findOne({ where: { id: userId } });
    
        if (!user) {
          throw this.errorHandler.handleError(errors.notFound, 'User not found with given ID');
        }

        user.status = userStatus.Active;

        await user.save();

        return new HttpResponseOK(user);
      } catch (response) {
        if (response instanceof HttpResponse)
          return response;
      
        this.logger.error(`${response}`);
        return new HttpResponseBadRequest();
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
