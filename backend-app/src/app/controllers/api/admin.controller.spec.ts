// std
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseOK } from '@foal/core';

// App
import { AdminController } from './admin.controller';

describe('AdminController', () => {

  let controller: AdminController;

  beforeEach(() => controller = createController(AdminController));

  describe('has a "foo" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(AdminController, 'foo'), 'GET');
      strictEqual(getPath(AdminController, 'foo'), '/');
    });

    // it('should return an HttpResponseOK.', () => {
    //   const ctx = new Context({});
    //   ok(isHttpResponseOK(controller.foo(ctx)));
    // });

  });

});
