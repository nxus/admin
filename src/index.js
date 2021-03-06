'use strict'

import Promise from 'bluebird'
import {NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'
import {nav, DataTablesMixin} from 'nxus-web'
import {application as app} from 'nxus-core'
import {users} from 'nxus-users'
import url from 'url'

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
    router.route('GET', this.config.adminUrl+"/help/:section", ::this._helpPage)
    templater.template(__dirname+'/templates/admin-help.ejs', this.config.pageTemplate)

    users.protectedRoute(this.config.adminUrl+'*')

    this._help = {}
  }

  _defaultConfig() {
    return {
      pageTemplate: 'admin-page',
      adminUrl: '/admin'
    }
  }

  _home(req, res) {
    return templater.render('admin-index', {help: this._help, title: "Welcome, Administrator"})
      .then(::res.send)
  }

  _helpPage(req, res) {
    let section = req.params.section
    return templater.render('admin-help', {help: this._help[section], section, title: "Instructions for "+section})
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
   * `admin.page('/route', () => { // return a response to be rendered within admin template })`
   * `admin.page({route: '/route', directHandler: true}, (req, res) => {...})`
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


  /**
   * Registers help text for the admin interface.
   *
   *
   * @param {String}  section  The nav section
   * @param {String}  welcome  The template partial name to render as welcome and help
   * @param {String}  [detail]  An additional partial to render on the help detail
   */
  help(section, welcome, detail) {
    this._help[section] = {welcome, detail}
  }

  _addNav(label, route, opts) {
    nav.add('admin-sidebar', label, route, opts)
  }

  _addPartial(partial, opts = {}) {
    let route = opts.route
    if(!route) throw new Error('Admin page must specify a route')
    router.route(route, (req, res) => {
      return templater.render(partial, {req, template: this.config.pageTemplate, ...opts}).then(::res.send)
    })
  }

  _addHandler(handler, opts = {method: 'get'}) {
    let route = opts.route
    if(!route) throw new Error('Admin page must specify a route')

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
   * Register an admin nav menu item, wraps web-nav for relative URls and menu name
   *
   * @param  {String} label Label for nav item
   * @param  {String} route Either a relative (joined with adminUrl) or absolute URL to link to
   * @param  {Object} opts  nav menu options for web-nav, e.g. icon, order
   */
  addNav(label, route, opts={}) {
    nav.add('admin-sidebar', label, url.resolve(this.config.adminUrl+"/", route), opts)
  }


  /**
   * Create an AdminController for a given model. Takes either the model identity, or an
   *  object to pass to the constructor of AdminController with at least {model: 'identity'}
   * @param  {String|Object} opts  The model identity or options object.
   */
  manage(opts = {}) {
    if(_.isString(opts)) opts = {model: opts}
    if(!opts.model) throw new Error('Admin.manage must be called with a model attribute or string name')
    if(opts.dataTables)
      new AdminControllerWithDataTables(opts)
    else
      new AdminController(opts)
  }
}

var admin = Admin.getProxy()
import AdminController from './AdminController'
class AdminControllerWithDataTables extends DataTablesMixin(AdminController) {
  constructor(opts) {
    super(opts)
  }
}
export {Admin as default, admin, AdminController}
