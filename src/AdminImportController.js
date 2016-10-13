import AdminController from './AdminController'
import {admin} from './'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'
import {dataManager} from 'nxus-data-manager'
import {nav} from 'nxus-web'
import {actions} from 'nxus-web'


export default class AdminImportController extends AdminController {
  constructor(opts) {
    super(opts)

    this.uploadOptions = opts.uploadOptions || {}
    this.uploadType = opts.uploadType || 'csv'
    
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
