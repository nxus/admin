'use strict';

import {AdminBase} from '../src/AdminBase'

import TestApp from '@nxus/core/lib/test/support/TestApp';

class AdminTest extends AdminBase {
  base_url () {
    return "/test"
  }
  model_id () {
    return 'test_model'
  }
  template_dir () {
    return './views'
  }
}

describe("AdminBase", () => {
  var module;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
  });
  
  describe("Load", () => {
    it("should not be null", () => AdminBase.should.not.be.null)

    it("should be instantiated", () => {
      module = new AdminTest(app);
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new AdminTest(app);
    });

    it("should register for app lifecycle", () => {
      app.on.called.should.be.true;
      app.on.calledWith('startup').should.be.true;
    });

    it("should have a base url", () => {
      module.base.should.equal('/test');
    });
    
    it("should have routes", () => {
      app.get('router').provide.calledWith('route', 'get', '/test').should.be.true;
      app.get('router').provide.calledWith('route', 'get', '/test/new').should.be.true;
      app.get('router').provide.calledWith('route', 'get', '/test/edit/:id').should.be.true;
      app.get('router').provide.calledWith('route', 'get', '/test/delete/:id').should.be.true;
      app.get('router').provide.calledWith('route', 'post', '/test/save').should.be.true;
    });
    
    it("should have a template prefix", () => {
      module.prefix.should.equal('admin-admintest');
    })
  });
});
