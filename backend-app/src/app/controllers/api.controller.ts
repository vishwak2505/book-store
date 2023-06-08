import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK, IAppController, UseSessions } from '@foal/core';
import { User } from '../entities';
import { AdminController, AuthController } from './api';

@ApiInfo({
  title: 'Application API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
@UseSessions({
  cookie: true,
  user: (id: number) => User.findOneBy({ id }),
})
export class ApiController {
  subControllers = [
    controller('/admin', AdminController),
    controller('/user', AuthController),
  ];
}
