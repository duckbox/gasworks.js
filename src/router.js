// Backbone.Router
// ---------------

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
var Router = Backbone.Router = function(options) {
  options || (options = {});

  this.el = document.body.querySelector(this.el);

  if (options.routes) this.routes = options.routes;
  this._bindRoutes();
  this.initialize.apply(this, arguments);
};

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

var isRegExp = function(value) {
  return value ? (typeof value === 'object' && toString.call(value) === '[object RegExp]') : false;
};

// Set up all inheritable **Backbone.Router** properties and methods.
_.extend(Router.prototype, Events, {

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

  // Manually bind a single named route to a callback. For example:
  //
  //     this.route('search/:query/p:num', 'search', function(query, num) {
  //       ...
  //     });
  //
  route: function(route, name, callback) {

    var params = (route.split('/')).filter(function( key ){
      return (key.substr(0,1) === ':');
    });

    params = params.map(function( key ){
      return key.substr(1);
    });

    if (!isRegExp(route)) route = this._routeToRegExp(route);

    if (typeof name === 'function' || typeof name === 'object') {
      callback = name;
      name = '';
    }

    var policy = null;
    
    if( typeof callback === 'object' ) {

      var view;

      if( callback.view ) {
        view = this._makeViewCallback( callback.view, params, callback.options );
      }

      if( callback.callback ) {
        view = callback.callback;
      }

      if( callback.policy ) {
        policy = callback.policy;
      }

      callback = view;

    } else if( callback.prototype && callback.prototype instanceof Backbone.View ) {
      
      callback = this._makeViewCallback( callback, params );

    }

    if (!callback) callback = this[name];
    var router = this;

    Backbone.history.route(route, function(fragment) {

      if( policy ) {
          
        policy.call(null,function(){
          router._fragmentDealer(fragment, route, callback);
        });

      } else {
        router._fragmentDealer(fragment, route, callback);
      }
      
      return this;

    });
  },

  _fragmentDealer : function( fragment, route, callback ) {
      
      var args = this._extractParameters(route, fragment);

      callback && callback.apply(this, args);

      if( this.oldView ) {
        Backbone.Renderer.write(function(){
          document.body.scrollTop = 0;
          this.oldView.remove();
        }, this);
      }
      
      this.trigger.apply(this, ['route:' + name].concat(args));
      this.trigger('route', name, args);
      Backbone.history.trigger('route', this, name, args);

  },

  // Simple proxy to `Backbone.history` to save a fragment into the history.
  navigate: function(fragment, options) {
    Backbone.history.navigate(fragment, options);
    return this;
  },

  // Bind all defined routes to `Backbone.history`. We have to reverse the
  // order of the routes here to support behavior where the most general
  // routes can be defined at the bottom of the route map.
  _bindRoutes: function() {
    if (!this.routes) return;
    this.routes = _.result(this, 'routes');
    var route, routes = Object.keys(this.routes);
    while ((route = routes.pop()) != null) {
      this.route(route, this.routes[route]);
    }
  },

  _makeViewCallback : function( view, params, options ) {      

    return function(){
      
      var paramList = {},
        args = arguments,
        settings = options || {};

      params.forEach(function(key, index){

        paramList[key] = args[index];

      });

      if( this.currentView ) {
        this.oldView = this.currentView;
      }

      this.currentView = new view( utils.extend(settings,{ params : paramList }) );

      Backbone.Renderer.write(function(){
        this.el.appendChild(this.currentView.render().el);
      }, this);

    }.bind(this);

  },

  // Convert a route string into a regular expression, suitable for matching
  // against the current location hash.
  _routeToRegExp: function(route) {
    route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional) {
                   return optional ? match : '([^\/]+)';
                 })
                 .replace(splatParam, '(.*?)');
    return new RegExp('^' + route + '$');
  },

  // Given a route, and a URL fragment that it matches, return the array of
  // extracted decoded parameters. Empty or unmatched parameters will be
  // treated as `null` to normalize cross-browser behavior.
  _extractParameters: function(route, fragment) {
    var params = route.exec(fragment).slice(1);
    return params.map(function(param) {
      return param ? decodeURIComponent(param) : null;
    });
  }

});
