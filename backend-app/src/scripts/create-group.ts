import { Group, Permission } from '@foal/typeorm';
import { dataSource } from '../db';

export const schema = {
  additionalProperties: false,
  properties: {
    codeName: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 80 },
    permissions: { type: 'array', items: { type: 'string' }, uniqueItems: true, default: [] }
  },
  required: [ 'name', 'codeName' ],
  type: 'object',
};

export async function main(args: { codeName: string, name: string, permissions: string[] }) {
  await dataSource.initialize();

  try {
    let group = await Group.findOne({ where: { codeName: args.codeName }, relations: ['permissions'] });
    if (!group) {
      group = new Group();
      group.name = args.name;
      group.codeName = args.codeName;
      group.permissions = []; 
    }

    group.name = args.name;

    for (const codeName of args.permissions) {
      const permission = await Permission.findOneBy({ codeName });
      if (!permission) {
        console.log(`No permission with the code name "${codeName}" was found.`);
        return;
      }
      
      const existingPermission = group.permissions.find((p) => p.codeName === codeName);
      if (!existingPermission) {
        group.permissions.push(permission);
      }
    }

    console.log(await group.save());
  } catch (error: any) {
    console.log(error.message);
  } finally {
    await dataSource.destroy();
  }
}

// foal run create-group name="Administrators" codeName="admin" permissions="[ \"view-user\", \"remove-user\", \"update-user\", \"view-book\", \"add-book\", \"remove-book\", \"update-book\" ]"
// foal run create-group name="Customers" codeName="customer" permissions="[ \"view-book-user\" ]"