'use strict';

import Promise from 'bluebird'
import {NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'
import {nav} from 'nxus-web'
import {application as app} from 'nxus-core'
import {users} from 'nxus-users'

import _ from 'underscore'
import morph from 'morph'

/**
 * The Base Admin class provides a web interface for managing Nxus applications and data.
 */
class Admin extends NxusModule {

  constructor() {
    super()

    if(this.config.adminUrl[0] != '/') this.config.adminUrl = "/"+this.config.adminUrl

    if(!app.config.admin) app.config.admin = {}

    app.config.admin = Object.assign({adminUrl: this.config.adminUrl}, app.config.admin)

    router.route('GET', this.config.adminUrl, ::this._home)
    templater.template(__dirname+'/templates/admin-index.ejs', this.config.pageTemplate)

    users.protectedRoute(this.config.adminUrl+'*')
  }

  _defaultConfig() {
    return {
      pageTemplate: 'admin-page', 
      adminUrl: '/admin'
    }
  }

  _home(req, res) {
    return templater.render('admin-index')
      .then(::res.send)
  }

  /**
   * @return {String} the root Url where the admin interface is available.
   */
  getAdminUrl() {
    return this.config.adminUrl
  }

  /**
   * Registers a page with the admin interface.  Pages can be defined two different ways.
   * 
   * ## Template Partials
   *
   * `admin.page('/route', 'partial-name')`
   *
   * ## Route Handlers
   *
   * `admin.page('/route', (req, res) => {...})`
   *
   * ## Options
   *
   * The first argument can either be a string or an options hash.  If an options hash, it 
   * must include a `route` attribute.
   *
   * Other options include:
   *
   * * `route`: Required. The route to the page.
   * * `method`: the HTTP method to use for the route.
   * * `label`: the nav label to use. Defaults to a title version of the route.
   * * `nav`: set to `false` to skip creating a nav item: useful for routes with no display.
   * * `directHandler`: if true, the handler is a full route handler. Otherwise, wrapped to send reponse
   * * `order`: the order of the nav menu.
   * * `icon`: the icon class to use for the page in the nav and other places.
   * 
   * @param {String|Object}  opts  The route or options for the page
   * @param {String|Function}  responder  The string partial name or handler function for the route
   */
  page(opts, responder) {
    if(_.isString(opts)) opts = {route: opts}

    if(!opts.label) opts.label = morph.toTitle(opts.route.replace(new RegExp('/', 'ig'), " "))

    opts.route = this._cleanRoute(opts.route)

    if(opts.nav === undefined || opts.nav) this._addNav(opts.label, opts.route, opts)

    if(_.isString(responder)) return this._addPartial(responder, opts)
    else return this._addHandler(responder, opts)
  }

  _addNav(label, route, opts) {
    nav.add('admin-sidebar', label, route, opts)
  }

  _addPartial(partial, opts = {}) {
    let route = opts.route
    if(!route) throw new Exception('Admin page must specify a route')
    router.route(route, (req, res) => {
      return templater.render(partial, {req, template: this.config.pageTemplate, ...opts}).then(::res.send)
    })
  }

  _addHandler(handler, opts = {method: 'get'}) {
    let route = opts.route
    if(!route) throw new Exception('Admin page must specify a route')

    let method = opts.method || 'get'

    if(opts.directHandler) return router.route(method, route, handler)
    
    router.route(method, route, (req, res) => {
      return Promise.resolve().then(() => {
        return handler({req, ...opts})
      }).then((r) => {
        if(_.isString(r))
          return templater.render(this.config.pageTemplate, {content: r})
        else
          return r
      }).then(::res.send)
    })
  }

  _cleanRoute(route) {
    if(route[0] != '/') route = "/"+route

    if(route.indexOf(this.config.adminUrl) != 0) route = this.config.adminUrl+route

    return route
  }

  /**
   * Create an AdminController for a given model. Takes either the model identity, or an 
   *  object to pass to the constructor of AdminController with at least {model: 'identity'}
   * @param  {String|Object} opts  The model identity or options object.
   */
  manage(opts = {}) {
    if(_.isString(opts)) opts = {model: opts}
    if(!opts.model) throw new Error('Admin.manage must be called with a model attribute or string name')
    new AdminController(opts)
  }
}

var admin = Admin.getProxy()
import AdminController from './AdminController'
export {Admin as default, admin, AdminController}

