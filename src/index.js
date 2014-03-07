var GasWorks = require('./../dist/gasworks');

var views = GasWorks.View.extend({
	initialize : function( options ){
		console.log('hai', options);
	},
	template: function(){
		return 'Hai!';
	}
});

var views2 = GasWorks.View.extend({
	initialize : function( options ){
		console.log('hai', this.params);
	},
	template: function(){
		return 'Hai I\'m test!';
	}
});



Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;
			
			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});


function model(){

	this.attributes = Object.create(null);

	Object.observe(this.attributes,function(){
		console.log(arguments);
	});

	return this.attributes;

}


var m = new model();

m.title = [{
	foo : 'yes'
}];


m.title = [{
	foo : 'no'
}];

console.log(m);





var test = false;

var Router = GasWorks.Router.extend({

	el : '.container',

	initialize : function() {
		console.log('Router beginsss');
	},

	routes : {
		'' : {
			view : views,
			options : {
				name : 'Butler'
			}
		},
		'test' : views2
	}

});

var r = new Router();

r.on('viewChange', function(view){
	console.log('viewChange', view);
});

GasWorks.history.start();