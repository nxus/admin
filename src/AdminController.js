import {EditController} from 'nxus-web'
import {nav} from 'nxus-web'
import {actions} from 'nxus-web'
import {permissions} from 'nxus-users'
import morph from 'morph'

import {application as app} from 'nxus-core'

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

    if(this.routePrefix[0] != '/') this.routePrefix = '/'+this.routePrefix
    
    nav.add('admin-sidebar', this.displayName, this.routePrefix, {subMenu: this.prefix+'-submenu', icon: this.icon, order: this.order})
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
  } 
}

export default AdminController
