import {EditController} from 'nxus-web'
import {nav} from 'nxus-web'
import {actions} from 'nxus-web'
import {permissions} from 'nxus-users'
import {templater} from 'nxus-templater'
import {dataManager} from 'nxus-data-manager'
import {admin} from './'
import morph from 'morph'

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
    opts.routePrefix = opts.routePrefix || app.config.admin.adminUrl+"/"+_modelIdentity
    opts.pageTemplate = opts.pageTemplate || 'admin-page'

    super(opts)

    this.displayName = opts.displayName || morph.toTitle(this.modelIdentity)
    this.icon = opts.icon || 'fa fa-files-o'
    this.order = opts.order || 0

    this.uploadOptions = opts.uploadOptions || {}
    this.uploadType = opts.uploadType || null

    this.adminGroup = opts.adminGroup || null
    if(!this.adminGroup && _modelIdentity.indexOf('-') > 0) {
      this.adminGroup = morph.toTitle(_modelIdentity.split('-')[0])
    }
    
    if(this.routePrefix[0] != '/') this.routePrefix = '/'+this.routePrefix

    let menu = 'admin-sidebar'
    if (this.adminGroup) {
      menu = "admin-"+this.adminGroup+'-submenu'
      nav.add('admin-sidebar', this.adminGroup, app.config.admin.adminUrl, {subMenu: menu, icon: 'fa fa-folder-open-o', order: this.order})
    }
    nav.add(menu, this.displayName, this.routePrefix, {subMenu: this.prefix+'-submenu', icon: this.icon, order: this.order})
    nav.add(this.prefix+'-submenu', 'Create', this.routePrefix+'/create', {icon: 'fa fa-plus'})

    actions.add(this.templatePrefix+"-list", "Add", "/create", {
      icon: "fa fa-plus"
    })

    actions.add(this.templatePrefix+"-list", "Edit", "/edit/", {
      group: "instance",
      icon: "fa fa-edit"
    })
    actions.add(this.templatePrefix+"-list", "Delete", "/delete/", {
      group: "instance",
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
    let opts = {type: this.uploadType, ...this.uploadOptions}
    dataManager.importFileToModel(this.modelIdentity, req.file.path, opts)
    .then((insts) => {
      req.flash('info', 'Imported '+insts.length+' '+this.displayName)
      res.redirect(this.routePrefix)
    })
  }
}

export default AdminController
