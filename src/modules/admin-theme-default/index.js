
import {NxusModule} from 'nxus-core'
import {templater} from 'nxus-templater'
import {router} from 'nxus-router'
 

class AdminDefaultTheme extends NxusModule {
  constructor() {
    super()
    templater.template(__dirname+'/layouts/admin-default.ejs')
    templater.template(__dirname+'/layouts/admin-page.ejs', 'admin-default')
    templater.templateDir(__dirname+'/partials/')

    router.staticRoute('/admin/assets', __dirname+'/assets')
  }
}

var adminDefaultTheme = AdminDefaultTheme.getProxy()
export {AdminDefaultTheme as default}
