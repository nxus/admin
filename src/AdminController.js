import {EditController} from 'nxus-web'
import {nav} from 'nxus-web'
import morph from 'morph'

import {application as app} from 'nxus-core'

class AdminController extends EditController {
  constructor(opts) {
    let _modelIdentity = opts.modelIdentity || morph.toDashed(new.target.name)

    opts.routePrefix = opts.routePrefix || app.config.admin.adminUrl+"/"+_modelIdentity
    opts.pageTemplate = opts.pageTemplate || 'admin-page'

    super(opts)
    
    this.displayName = morph.toTitle(this.modelIdentity)
    this.icon = opts.icon || 'fa fa-files-o'
    this.order = opts.order || 0

    if(this.routePrefix[0] != '/') this.routePrefix = '/'+this.routePrefix
    
    nav.add('admin-sidebar', this.displayName, this.routePrefix, {subMenu: this.prefix+'-submenu', icon: this.icon, order: this.order})
    nav.add(this.prefix+'-submenu', 'Create', this.routePrefix+'/create', {icon: 'fa fa-plus'})
  } 
}

export default AdminController