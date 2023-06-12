import { Context, Get, Hook, HttpResponse, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Post, UserRequired, ValidateQueryParam, dependency, File } from '@foal/core';
import { Disk, ParseAndValidateFiles } from '@foal/storage';
import { User } from '../../entities';
import { LoggerService } from '../../services/logger';
import { Bookrented } from '../../entities/bookstore';
import { JWTRequired } from '@foal/jwt';

@JWTRequired({
  cookie: true,
  user: (id: number) => User.findOneBy({ id })
})
export class ProfileController {

    @dependency
    disk: Disk;
  
    @dependency
    logger: LoggerService;

    @Get('/viewProfile')
    @UserRequired()
    async userProfile(ctx: Context<User>) {

      try {
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
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
    }
  
    @Get('/avatar')
    @UserRequired()
    async readProfileImage(ctx: Context<User>) {

      try {
        let user = ctx.user;
        
        if (!user) {
          throw new HttpResponseNotFound('No user found');
        }
    
        if (!user.avatar) {
          return this.disk.createHttpResponse('images/profiles/default.png');
        }
    
        return this.disk.createHttpResponse(user.avatar);
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
      
    }
  
    @Post('/updateProfile')
    @UserRequired()
    @ParseAndValidateFiles(
      {
        avatar: { required: false, saveTo: 'images/profiles/uploaded' }
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 255 }
        },
      }
    )
    @Hook(() => {
      
      console.log('uploading profile picture');
  
      return () => {
        console.log('profile picture updated');
      };
    })
    async updateProfileImage(ctx: Context<User>) {

      try{
        const name = ctx.request.body.name;

        if (name != '') {
          ctx.user.name = name;
        }

        const file: File|undefined = ctx.files.get('avatar')[0];
        if (file) {
          if (ctx.user.avatar) {
            await this.disk.delete(ctx.user.avatar);
            this.logger.info(`${ctx.user.name} updated profile picture`);
          }
          ctx.user.avatar = file.path;
        }
    
        await ctx.user.save();
    
        return new HttpResponseNoContent();
      } catch (e) {
        if (e instanceof Error || e instanceof HttpResponse) {
          return this.logger.returnError(e);
        } else {
          return new HttpResponseBadRequest(e);
        }
      }
      
    }
  
}
