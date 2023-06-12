import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK, IAppController, UseSessions } from '@foal/core';
import { User } from '../entities';
import { AdminController, AuthController, GetbooksController, ProfileController } from './api';
import { JWTRequired } from '@foal/jwt';

@ApiInfo({
  title: 'Application API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
export class ApiController {
  subControllers = [
    controller('/admin', AdminController),
    controller('/user', AuthController),
    controller('/profile', ProfileController),
    controller('/getbooks', GetbooksController)
  ];
}
