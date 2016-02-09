'use strict';

import {HasModels} from '@nxus/storage'

export class AdminBase extends HasModels {

  constructor(app) {
    super(app)
    this.app = app
    this.router = app.get('router')
    this.templater = app.get('templater')
    this.base = this.base_url()
    this.prefix = this.template_prefix()
    this.populate = this.model_populate()

    this.templater.templateDir('ejs', this.template_dir(), this.prefix)

    this.router.route('get', this.base, this._list.bind(this))
    this.router.route('get', this.base+'/new', this._new.bind(this))
    this.router.route('get', this.base+'/edit/:id', this._edit.bind(this))
    this.router.route('get', this.base+'/delete/:id', this._delete.bind(this))
    this.router.route('post', this.base+'/save', this.save.bind(this))
  }

  /**
   * Define the base URL for this admin module
   * @return {string} 
   */
  base_url () {
    throw this.constructor.name+".base_url not implemented"
  }

  /**
   * Define the primary model for this admin module
   * @return {string} 
   */
  model_id () {
    throw this.constructor.name+".model_id not implemented"
  }

  /**
   * Render the display name for the model
   * @return {string} 
   */
  display_name () {
    var name = this.model_id()
    name = name[0].toUpperCase()+name.slice(1, name.length);
    return name;
  }

  /**
   * Define any populated relationships for the model
   * @return {array} 
   */
  model_populate () {
    return null
  }
  
  /**
   * Define the template dir - needs to be implemented for local __dirname
   * @return {string} 
   */
  template_dir () {
    throw this.constructor.name+".template_dir not implemented"
  }

  /**
   * Define the template prefix for this admin module
   * @return {string} 
   */
  template_prefix () {
    return "admin-"+this.constructor.name.toLowerCase()
  }

  model_names () {
    let ret = {}
    ret[this.model_id()] = 'model'
    return ret;
  }
  
  _list (req, res) {
    let find = this.models.model.find().where({})
    if (this.populate) {
      find = find.populate(...this.populate)
    }
    find.then((insts) => {
      this.templater.request('renderPartial', this.prefix+'-list', 'page', {
        req,
        base: this.base,
        user: req.user,
        title: 'All '+this.constructor.name,
        insts
      }).then(res.send.bind(res));
    })
  }

  _edit (req, res) {
    let find = this.models.model.findOne().where(req.params.id)
    if (this.populate) {
      find = find.populate(...this.populate)
    }
    find.then((inst) => {
      this.templater.request('renderPartial', this.prefix+'-form', 'page', {
        req,
        base: this.base,
        user: req.user,
        title: 'Edit '+this.constructor.name,
        inst
      }).then(res.send.bind(res));
    })
  }

  _new (req, res) {
    let inst = {}
    if(this.populate && this.populate.length > 0) 
      for (let pop of this.populate) inst[pop] = {}
    this.templater.request('renderPartial', this.prefix+'-form', 'page', {
      req,
      base: this.base,
      user: req.user,
      title: 'New '+this.constructor.name,
      inst
    }).then(res.send.bind(res));
  }

  _delete (req, res) {
    this.models.model.destroy(req.params.id).then((inst) => {
      req.flash('info', this.display_name()+' deleted');
      res.redirect(this.base)
    })
  }

  save (req, res) {
    return this._save(req, res)
  }

  _save (req, res, values) {
    if (values === undefined) {
      values = req.body
    }
    let promise = values.id
      ? this.models.model.update(values.id, values)
      : this.models.model.create(values)

    promise.then((u) => {req.flash('info', this.display_name()+' created');; res.redirect(this.base)})
  }
}

// Nxus requires modules to provide a module function
export default function () {}

