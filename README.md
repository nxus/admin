# nxus-admin

## Admin

**Extends NxusModule**

The Base Admin class provides a web interface for managing Nxus applications and data.

### getAdminUrl

Returns **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the root Url where the admin interface is available.

### page

Registers a page with the admin interface.  Pages can be defined two different ways.

### Template Partials

`admin.page('/route', 'partial-name')`

### Route Handlers

`admin.page('/route', (req, res) => {...})`

### Options

The first argument can either be a string or an options hash.  If an options hash, it 
must include a `route` attribute.

Other options include:

-   `route`: Required. The route to the page.
-   `method`: the HTTP method to use for the route.
-   `label`: the nav label to use. Defaults to a title version of the route.
-   `nav`: set to `false` to skip creating a nav item: useful for routes with no display.
-   `directHandler`: if true, the handler is a full route handler. Otherwise, wrapped to send reponse
-   `order`: the order of the nav menu.
-   `icon`: the icon class to use for the page in the nav and other places.

**Parameters**

-   `opts` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))** The route or options for the page
-   `responder` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The string partial name or handler function for the route

### addNav

Register an admin nav menu item, wraps web-nav for relative URls and menu name

**Parameters**

-   `label` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Label for nav item
-   `route` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either a relative (joined with adminUrl) or absolute URL to link to
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** nav menu options for web-nav, e.g. icon, order

### manage

Create an AdminController for a given model. Takes either the model identity, or an 
 object to pass to the constructor of AdminController with at least {model: 'identity'}

**Parameters**

-   `opts` **\[([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))](default {})** The model identity or options object.

## AdminController

**Extends EditController**

A base class for admin model controllers. Overrides the EditController options defaults
to provide admin prefixes for routes ("/admin/model-identity") and templates ("model-identity-admin"), and by default wraps templates in 'admin-page' rather than 'page'.

## Parameters (in addition to EditController parameters)

-   `icon` - icon class for nav - defaults to fa-files-o
-   `order` - optional ordering for nav
-   `uploadType` - dataManager import type (e.g. csv, json), if set an Import action is available.
-   `uploadOptions` - options to pass to dataManager parser

### addNav

Register an admin nav menu item under this model

**Parameters**

-   `label` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Label for nav item
-   `route` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either a relative (joined with adminUrl) or absolute URL to link to
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** nav menu options for web-nav, e.g. icon, order

### addAction

Register an admin action item for this model, wrapping web-actions

**Parameters**

-   `page` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Template suffix: 'list', 'edit', 'create', 'detail'
-   `label` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Label for action
-   `route` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Sub-route for action
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** options for web-actions, e.g. icon, template

### addInstanceAction

Register an admin instance action item for this model's list page, wrapping web-actions

**Parameters**

-   `label` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Label for action
-   `route` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Sub-route for action
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** options for web-actions, e.g. icon, template
