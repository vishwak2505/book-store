import { Context, controller, Delete, dependency, Get, hashPassword, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseUnauthorized, PermissionRequired, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { BooksController } from './admin';
import { User } from '../../entities';
import { LoggerService } from '../../../helper/logger';
import { Group, Permission } from '@foal/typeorm';
import { Book, Bookrented } from '../../entities/bookstore';
import { getConnection } from 'typeorm';

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
      const email = ctx.request.body.email;
      const password = ctx.request.body.password;
      const adminPassword = ctx.request.body.adminPassword;
      try{
        if (adminPassword != 'abcd') {
          throw new HttpResponseForbidden();
        }
        const user = await User.findOneBy({ email });
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
          
        if (!(await verifyPassword(password, user.password))) {
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
        const email = ctx.request.body.email;
        const password = ctx.request.body.password;
    
        const user = new User();
        user.email = email;
        user.amount_due = 0;
        user.name = 'Unknown';
        user.password = await hashPassword(password);
        user.groups = [];
        user.userPermissions = [];
        const codeName = "admin";
        const group = await Group.findOneBy({codeName});

        if (!group) {
          throw new HttpResponseBadRequest('No group found');
        }
        
        user.groups.push(group);

        const queryBuilder = Group.createQueryBuilder('group')
          .leftJoinAndSelect('group.permissions', 'permission')
          .where('group.codeName = :groupName', { groupName: codeName })
          .select('permission.codeName', 'codeName');

        const permissions = await queryBuilder.getRawMany();  

        if (!permissions) throw new HttpResponseBadRequest('No permission found');
        
        for (const perm of permissions) {
          const permission = await Permission.findOneBy({ codeName: perm.codeName });
          if (!permission) {
            this.logger.warn(`No permission with the code name "${codeName}" was found.`);
            throw new HttpResponseBadRequest('Permission not fount');
          }
          user.userPermissions.push(permission);
        }
        console.log(user.userPermissions);

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
      // try{
      //   const user = await User.findOne({ where: { id: userId }, relations: ['book_rented'] });

      //   if (!user) {
      //     throw new HttpResponseNotFound('User not found');
      //   }
      //   // try {
      //   //   await Bookrented.remove(user.book_rented);
      //   // } catch (e) {
      //   //   console.log(e);
      //   // }
        
      //   try {
      //     if (user.book_rented) {
      //       const bookIds = user.book_rented
      //         .filter((bookRented) => bookRented.book)
      //         .map((bookRented) => bookRented.book.id);

            

      //       if (bookIds.length > 0) {
      //         await Book.createQueryBuilder()
      //           .update(Book)
      //           .set({ availability: true })
      //           .whereInIds(bookIds)
      //           .execute();
      //       }
      //     }
      //   } catch (e) {
      //     console.log(e);
      //   }
        
      //   await user.remove();
      //   return new HttpResponseOK(user);
      // } catch (e) {
      //   this.logger.error(e as Error);
      //   return new HttpResponseBadRequest();
      // }

      try {
        const user = await User.findOne({ where: { id: userId }, relations: ['book_rented'] });
    
        if (!user) {
          throw new HttpResponseNotFound('User not found');
        }
    
        // Update the book availability to true
        try {
          const books =  await Book.createQueryBuilder('book')
          .select('book.id', 'bookId')
          .innerJoin('book.book_rented', 'bookRented')
          .where('bookRented.user = :userId', { userId })
          .getRawMany();

          const bookIds = books.map(obj => obj.bookId);
          console.log(bookIds);

          await Book
          .createQueryBuilder()
          .update()
          .set({ availability: true })
          .whereInIds(bookIds)
          .execute();
        } catch (e) {
          console.log(e);
        }
       
    
        // Remove the user
        await user.remove();
    
        return new HttpResponseOK(user);
      } catch (e) {
        this.logger.error(e as Error);
        return new HttpResponseBadRequest();
      }
    }
}
