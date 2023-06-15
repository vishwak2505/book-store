import { HttpResponseBadRequest, HttpResponseForbidden, HttpResponseUnauthorized, dependency, hashPassword, verifyPassword } from "@foal/core";
import { Group, Permission, User, userStatus } from "../../entities/user.entity";
import { LoggerService } from "../logger";

export class Credentials {
    @dependency
    logger: LoggerService;

    async signUpUser(userDetails: {name: string, email: string, password: string, group: string}) {

        const user = new User();
        user.email = userDetails.email;
        user.amount_due = 0;
        user.name = userDetails.name;
        user.password = await hashPassword(userDetails.password);
        user.groups = [];
        user.avatar = "";
        user.userPermissions = [];
        user.status = userStatus.Active;

        const codeName = userDetails.group;
        
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

        if (!permissions) {
          throw new HttpResponseBadRequest('No permission found');
        }  
        
        for (const perm of permissions) {
          const permission = await Permission.findOneBy({ codeName: perm.codeName });
          if (!permission) {
            this.logger.warn(`No permission with the code name "${codeName}" was found.`);
            throw new HttpResponseBadRequest('Permission not fount');
          }
          user.userPermissions.push(permission);
        }
        
        return user;
    }

    async loginUser(userDetails: {email: string, password: string, group: string}) {
        const user = await User.findOneBy({ email: userDetails.email });
        const group = await Group.findOneBy({ codeName: userDetails.group });

        if (!user || user.status == userStatus.Inactive || !group) {
           throw new HttpResponseUnauthorized('No user found');
        }

        const userGroups = await User.createQueryBuilder('user')
          .leftJoinAndSelect('user.groups', 'groups')
          .where('user.id = :userId', { userId: user.id })
          .getOne();

        if (!userGroups || !userGroups.groups.some(g => g.id === group.id)) {
            throw new HttpResponseForbidden(`User is not ${userDetails.group}`);
        }  
          
        if (!(await verifyPassword(userDetails.password, user.password))) {
          throw new HttpResponseForbidden('Wrong password');
        }

        return user;
    }
}
