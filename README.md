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
-   `order`: the order of the nav menu.
-   `icon`: the icon class to use for the page in the nav and other places.

**Parameters**

-   `opts` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))** The route or options for the page
-   `responder` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The string partial name or handler function for the route

### manage

**Parameters**

-   `Object`  
-   `opts`   (optional, default `{}`)

Returns **\[type]** 
