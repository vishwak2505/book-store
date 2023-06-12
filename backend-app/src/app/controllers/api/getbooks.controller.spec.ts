// std
import { ok, strictEqual } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseOK } from '@foal/core';

// App
import { GetbooksController } from './getbooks.controller';

describe('GetbooksController', () => {

  let controller: GetbooksController;

  beforeEach(() => controller = createController(GetbooksController));

  describe('has a "foo" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(GetbooksController, 'foo'), 'GET');
      strictEqual(getPath(GetbooksController, 'foo'), '/');
    });

    it('should return an HttpResponseOK.', () => {
      const ctx = new Context({});
      ok(isHttpResponseOK(controller.foo(ctx)));
    });

  });

});
