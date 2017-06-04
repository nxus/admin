'use strict'

import Promise from 'bluebird'
import {EditController} from 'nxus-web'
import {nav} from 'nxus-web'
import {actions} from 'nxus-web'
import {permissions} from 'nxus-users'
import {templater} from 'nxus-templater'
import {dataManager} from 'nxus-data-manager'
import {admin} from './'
import morph from 'morph'
import url from 'url'
import moment from 'moment'

import {application as app} from 'nxus-core'

/**
 * A base class for admin model controllers. Overrides the EditController options defaults
 * to provide admin prefixes for routes ("/admin/model-identity") and templates ("model-identity-admin"), and by default wraps templates in 'admin-page' rather than 'page'.
 *
 * # Parameters (in addition to EditController parameters)
 *  * `icon` - icon class for nav - defaults to fa-files-o
 *  * `order` - optional ordering for nav
 *  * `uploadType` - dataManager import type (e.g. csv, json), if set an Import action is available.
 *  * `uploadOptions` - options to pass to dataManager parser
 */


class AdminController extends EditController {
  constructor(opts) {
    let _modelIdentity = opts.model || opts.modelIdentity || morph.toDashed(new.target.name)
    opts.modelIdentity = _modelIdentity
    opts.prefix = opts.prefix || _modelIdentity+"-admin"
    opts.routePrefix = opts.routePrefix
    let adminUrl = '/admin'
    if (!opts.routePrefix && app.config && app.config.admin && app.config.admin.adminUrl) {
      adminUrl = app.config.admin.adminUrl
      opts.routePrefix = adminUrl+"/"+_modelIdentity
    }
    opts.pageTemplate = opts.pageTemplate || 'admin-page'

    super(opts)

    this.displayName = opts.displayName || morph.toTitle(this.modelIdentity)
    this.icon = opts.icon || 'fa fa-files-o'
    this.order = opts.order || 0

    this.uploadOptions = opts.uploadOptions || {}
    this.uploadType = opts.uploadType || null
    this.downloadType = opts.downloadType || null

    this.adminGroup = opts.adminGroup || null
    if(!this.adminGroup && _modelIdentity.indexOf('-') > 0) {
      this.adminGroup = morph.toTitle(_modelIdentity.split('-')[0])
    }

    if(this.routePrefix[0] != '/') this.routePrefix = '/'+this.routePrefix

    let menu = 'admin-sidebar'
    if (this.adminGroup) {
      menu = "admin-"+this.adminGroup+'-submenu'
      admin.addNav(this.adminGroup, "", {subMenu: menu, icon: 'fa fa-folder-open-o', order: this.order})
    }
    this._subMenu = this.prefix+'-submenu'
    nav.add(menu, this.displayName, this.routePrefix, {subMenu: this._subMenu, icon: this.icon, order: this.order})

    this.addNav('View', '', {icon: 'fa fa-list'})
    this.addNav('Create', 'create', {icon: 'fa fa-plus'})

    this.addAction('list', 'Add', "/create", {icon: 'fa fa-plus'})
    this.addInstanceAction("Edit", "/edit/", {icon: "fa fa-edit"})
    this.addInstanceAction("Delete", "/delete/", {
      icon: "fa fa-remove",
      template: 'actions-button-post',
      templateMinimal: 'actions-icon-post'
    })

    permissions.allow(
      "admin-manage-"+this.modelIdentity,
      this.routePrefix,
      null,
      "Admin"
    )

    if (this.uploadType) {
      this._setupImport()
    }
    if (this.downloadType) {
      this._setupDownload()
    }
  }

  /**
   * Register an admin nav menu item under this model
   *
   * @param  {String} label Label for nav item
   * @param  {String} route Either a relative (joined with adminUrl) or absolute URL to link to
   * @param  {Object} opts  nav menu options for web-nav, e.g. icon, order
   */
  addNav(label, route, opts={}) {
    return nav.add(this._subMenu, label, url.resolve(this.routePrefix+"/", route), opts)
  }

  /**
   * Register an admin action item for this model, wrapping web-actions
   *
   * @param  {String} page  Template suffix: 'list', 'edit', 'create', 'detail'
   * @param  {String} label Label for action
   * @param  {String} route Sub-route for action
   * @param  {Object} opts  options for web-actions, e.g. icon, template
   */
  addAction(page, label, route, opts={}) {
    return actions.add(this.templatePrefix+"-"+page, label, route, opts)
  }

  /**
   * Register an admin instance action item for this model's list page, wrapping web-actions
   *
   * @param  {String} label Label for action
   * @param  {String} route Sub-route for action
   * @param  {Object} opts  options for web-actions, e.g. icon, template
   */
  addInstanceAction(label, route, opts={}) {
    return this.addAction('list', label, route, {group: 'instance', ...opts})
  }

  _setupDownload() {
    let exportRoute = this.routePrefix+'/export'
    admin.page({
      route: exportRoute,
      nav: false,
      directHandler: true
    }, ::this._download)
    nav.add(this.prefix+'-submenu', 'Download', exportRoute, {icon: 'fa fa-download'})
    actions.add(this.templatePrefix+"-list", "Download", "/export", {
      icon: "fa fa-download"
    })
  }

  _setupImport() {
    let importRoute = this.routePrefix+'/import'
    dataManager.uploadPath(importRoute, 'file')
    admin.page({
      route: importRoute,
      nav: false,
      upload: this.uploadType,
      base: this.routePrefix,
      title: "Import "+this.displayName,
      displayName: this.displayName
    }, this.templatePrefix+'-import')
    admin.page({
      route: importRoute,
      nav: false,
      directHandler: true,
      method: 'POST'
    }, ::this._saveImport)

    templater.default().template(__dirname+"/templates/admin-import.ejs", this.pageTemplate, this.templatePrefix+"-import")

    nav.add(this.prefix+'-submenu', 'Import', importRoute, {icon: 'fa fa-upload'})
    actions.add(this.templatePrefix+"-list", "Import", "/import", {
      icon: "fa fa-upload"
    })

  }

  _saveImport (req, res) {
    this._performImport(req.file.path).then((insts) => {
      req.flash('info', 'Imported '+insts.length+' '+this.displayName)
      res.redirect(this.routePrefix)
    })
  }
  _performImport (path)  {
    let opts = {type: this.uploadType, ...this.uploadOptions}
    return dataManager.importFileToModel(this.modelIdentity, path, opts)
  }

  /**
   * Override in subclass to do additional formatting of records for download
   *
   * @param  {Object} record
   * @returns {Object} formatted record
   */
  _formatDownloadRecord(record, attrs) {
    let ret = {}
    attrs.forEach((f) => {
      ret[f.name] = record[f.name]
      if (record[f.name]) {
        if (f.type == 'datetime' || f.type == 'date') {
          ret[f.name] = moment(ret[f.name]).format()
        }
      }
    })
    return ret
  }

  _download (req, res) {
    let find = this.model.find()
    if (this.populate) {
      find.populate(this.populate)
    }
    return Promise.all([
      find,
      this._modelAttributes(true),
    ]).spread((records, attrs) => {
      return Promise.map(records, (x) => {
        return this._formatDownloadRecord(x, attrs)
      })
    }).then((records) => {
      return dataManager.export(this.downloadType, records)
    }).then((contents) => {
      res.type('text/'+this.downloadType)
      res.attachment(`${this.displayName}.${this.downloadType}`)
      res.send(contents)
    })
  }
}

export default AdminController
