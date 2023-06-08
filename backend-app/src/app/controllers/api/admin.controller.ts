import { Context, controller, Delete, dependency, Get, hashPassword, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, HttpResponseUnauthorized, PermissionRequired, Post, UserRequired, UseSessions, ValidateBody, ValidatePathParam, verifyPassword } from '@foal/core';
import { BooksController } from './admin';
import { User } from '../../entities';
import { LoggerService } from '../../../helper/logger';
import { Group, Permission } from '@foal/typeorm';

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
        const user = await User.findOneBy({ email });

        if (!user) {
          throw new HttpResponseUnauthorized();
        }
    
        if (!(await verifyPassword(password, user.password))) {
          throw new HttpResponseForbidden();
        }

        if (adminPassword != 'abcd') {
          throw new HttpResponseUnauthorized();
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
        const codeName = "admin";
        const group = await Group.findOneBy({codeName});
        if (!group) throw new HttpResponseBadRequest();
        user.groups.push(group);

        const queryBuilder = Group.createQueryBuilder('group')
          .leftJoinAndSelect('group.permissions', 'permission')
          .where('group.codeName = :groupName', { groupName: codeName })
          .select('permission.codeName', 'codeName');

        const permissions = await queryBuilder.getRawMany();  

        if (!permissions) throw new HttpResponseBadRequest();
        
        for (const perm of permissions) {
          const permission = await Permission.findOneBy({ codeName: perm.codeName });
          if (!permission) {
            //logger.warn(`No permission with the code name "${codeName}" was found.`);
            return;
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
        return new HttpResponseBadRequest();
      }
    }

    @Get('/allUsers')
    @UserRequired()
    async viewUsers () {
      let queryBuilder = User
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('group.codeName = :codeName', { codeName: 'user'})
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.amount_due'
      ]);

      const users = await queryBuilder.getMany();
      return new HttpResponseOK(users);
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
    @PermissionRequired('delete-user')
    @ValidatePathParam('userId', { type: 'number' })
    async deleteUser(ctx: Context<User>, { userId }: { userId: number }) {
      
      try{
        const user = await User.findOneBy({id: userId});

        if (!user) {

          throw new HttpResponseNotFound();
        }
        await user.remove();
        return new HttpResponseOK(user);
      } catch (e) {
        return new HttpResponseBadRequest();
      }
    }
}
