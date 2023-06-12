import { Permission } from '@foal/typeorm';
import { dataSource } from '../db';

export const schema = {
  additionalProperties: false,
  properties: {
    codeName: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
  },
  required: [ 'name', 'codeName' ],
  type: 'object',
};

export async function main(args: { codeName: string, name: string }) {
  const permission = new Permission();
  permission.codeName = args.codeName;
  permission.name = args.name;

  await dataSource.initialize();

  try {
    console.log(
      await permission.save()
    );
  } catch (error: any) {
    console.log(error.message);
  } finally {
    await dataSource.destroy();
  }
}


// foal run create-perm name="Permission to add users" codeName="add-user"
// foal run create-perm name="Permission to remove users" codeName="remove-user"
// foal run create-perm name="Permission to view users" codeName="view-users"
// foal run create-perm name="Permission to add books" codeName="add-book"
// foal run create-perm name="Permission to remove books" codeName="remove-book"
// foal run create-perm name="Permission to update books" codeName="update-book"
// foal run create-perm name="Permission to view books" codeName="view-book"
// foal run create-perm name="Permission to view books user" codeName="view-book-admin"