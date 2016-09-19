
import {NxusModule} from 'nxus-core'
import {templater} from 'nxus-templater'
 

class AdminDefaultTheme extends NxusModule {
  constructor() {
    super()
    templater.template(__dirname+'/layouts/admin-default.ejs')
    templater.template(__dirname+'/layouts/admin-page.ejs', 'admin-default')
  }
}

var adminDefaultTheme = AdminDefaultTheme.getProxy()
export {AdminDefaultTheme as default}