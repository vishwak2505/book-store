import { Context, dependency, hashPassword, HttpResponseBadRequest, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, ValidateBody, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { LoggerService } from '../../../helper/logger';
import { Group, Permission } from '@foal/typeorm';

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

        const permissions = await queryBuilder.getRawMany();  
        
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
          id: user.id,
          name: user.name,
        });
      } catch (e){
        this.logger.error(e as Error);
        return new HttpResponseBadRequest();
      }
    }

}