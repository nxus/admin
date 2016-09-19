'use strict';

import {NxusModule} from 'nxus-core'
import {router} from 'nxus-router'

import AdminController from './AdminController'

/**
 * The Base Admin class provides a web interface for managing Nxus applications and data.
 */
class Admin extends NxusModule {

  constructor() {
    super()
  }

  /**
   * Register a raw route for inclusion in the admin site
   * @param {String} route  The url path for the page
   * @param {function} handler for rendering this page
   */
  page(route, opts = {}, handler) {
    if(!handler) {
      handler = opts
      opts = {}
    }
    let method = opts.method || 'get'
    if(route[0] != "/") route = "/"+route
    route = this.opts.basePath+route
    this.log('registering admin route', route)
    router.route(method, route, handler)
  }

  /**
   * @param  {Object} 
   * @return {[type]}
   */
  manage (model) {

  }
}

var admin = Admin.getProxy()
export {Admin as default, admin, AdminController}

