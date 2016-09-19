import {EditController} from 'nxus-web'
import morph from 'morph'

class AdminController extends EditController {
  constructor(opts) {
    let _modelIdentity = opts.modelIdentity || morph.toSnake(new.target.name)

    opts.routePrefix = opts.routePrefix || '/admin/'+_modelIdentity
    opts.pageTemplate = opts.pageTemplate || 'admin-page'
    super(opts)
  } 
}

export default AdminController