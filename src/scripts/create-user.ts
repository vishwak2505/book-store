import { hashPassword } from '@foal/core';
import { Group, Permission } from '@foal/typeorm';
import { User } from '../app/entities';
import { dataSource } from '../db';
import { LoggerService } from '../app/services/logger';

export const schema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    groups: { type: 'array', items: { type: 'string' }, uniqueItems: true, default: [] },
    password: { type: 'string', maxLength:4 },
    userPermissions: { type: 'array', items: { type: 'string' }, uniqueItems: true, default: [] },
    name: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  type: 'object',
};

export async function main(args) {

  const logger = new LoggerService();

  const user = new User();
  user.name = args.name;
  user.userPermissions = [];
  user.groups = [];
  user.email = args.email;
  user.password = await hashPassword(args.password);
  user.amount_due = 0;

  await dataSource.initialize();

  for (const codeName of args.userPermissions as string[]) {
    const permission = await Permission.findOneBy({ codeName });
    if (!permission) {
      logger.warn(`No permission with the code name "${codeName}" was found.`);
      return;
    }
    user.userPermissions.push(permission);
  }

  for (const codeName of args.groups as string[]) {
    const group = await Group.findOneBy({ codeName });
    if (!group) {
      logger.warn(`No group with the code name "${codeName}" was found.`);
      return;
    }
    user.groups.push(group);
  }

  try {
    console.log(
      await user.save()
    );
  } catch (error: any) {
    logger.error(error.message);
  } finally {
    await dataSource.destroy();
  }
}