import {EditController} from 'nxus-web'
import {nav} from 'nxus-web/lib/modules/web-nav'
import morph from 'morph'

class AdminController extends EditController {
  constructor(opts) {
    let _modelIdentity = opts.modelIdentity || morph.toSnake(new.target.name)

    opts.routePrefix = opts.routePrefix || '/admin/'+_modelIdentity
    opts.pageTemplate = opts.pageTemplate || 'admin-page'
    super(opts)
    this.displayName = morph.toTitle(this.modelIdentity)
    this.icon = opts.icon || 'fa fa-files-o'
    nav.add('admin-sidebar', this.displayName, this.routePrefix, {subMenu: this.prefix+'-submenu', icon: this.icon})
    nav.add(this.prefix+'-submenu', 'Create', this.routePrefix+'/create', {icon: 'fa fa-plus'})
  } 
}

export default AdminController