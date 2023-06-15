import { ApiInfo, ApiServer, Context, controller, Get, Hook, HttpResponseNoContent, HttpResponseOK, IAppController, Options, UseSessions } from '@foal/core';
import { AdminController, AuthController, GetbooksController, ProfileController } from './api';

@ApiInfo({
  title: 'Application API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
@Hook(ctx => response => {
  response.setHeader('Access-Control-Allow-Origin', ctx.request.get('Origin') || '*');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
})
export class ApiController {
  subControllers = [
    controller('/admin', AdminController),
    controller('/user', AuthController),
    controller('/profile', ProfileController),
    controller('/getbooks', GetbooksController)
  ];

  @Options('*')
  options(ctx: Context) {
    const response = new HttpResponseNoContent();
    response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return response;
  }
}