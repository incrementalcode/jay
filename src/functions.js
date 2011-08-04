
// TODO this module should be excluded from build and docs until it is more stable (bind() vs ecma, order of params)

/* Functions module */

jay.namespace(global, 'jay', function(jay) {

	/* working with functions */

	// a statement block with it's own scope, which will run immediately, and a reference to the block will be returned so it can be run again if needed.
	jay.block = function(F) {
		F(); return F;
	}
	
	// calls the function as a constructor returning the result, no parameters may be given.
	// the scope function can do it's own aliasing of the 'this' object or create any other objects it needs itself.
	jay.scope = function(F) {
		return new F()
	}
	
	// declare a function signature, adds to readability, any calls to the function will result in a 'Function Not Implemented' error. 
	// It also allows reflectors to see that the function is abstract.
	jay.abstract = function(F) {
		var A = function () {
			throw new Error("Function Not Implemented")
		}
		// so we can make constructors (and the result of type()) abstract
		F.prototype.constructor = A;
		A.prototype = F.prototype;
		A.isAbstract = true;
		return A
	}
	
	// in comparison to Function.prototype.bind, this version accepts an array of arguments to bind, and obviously enables prefix usage.
	jay.bind = function(thisObj/* this, argsArray, F */) {
		var	slice = [].slice,
			args = (arguments.length > 2) ? arguments[1] : [], 
			self = arguments[arguments.length - 1], 
			nop = function () {}, 
			bound = function () {
			  return self.apply( this instanceof nop ? this : ( obj || {} ), 
								  args.concat( slice.call(arguments) ) );    
			};

		nop.prototype = self.prototype;

		bound.prototype = new nop();

		return bound;
	}
	
	jay.partial = function(/* argsArray, F */) {
		return jay.bind(null, arguments[0], arguments[1])
	}
	
	jay.call = function(/* (this (, arg1, arg2, ...), ) F */) {
		var context, F = arguments[arguments.length - 1];
		if (arguments.length == 1)
			return F();
		else {
			context = arguments[0];
			
			if (arguments.length == 2)
				return F.apply(context);
			else
				return F.apply(context, [].slice.call(arguments, 1, arguments.length - 1));
		}
	}
	
	jay.apply = function(/* (this (, [argsArray]), ) */ F) {
		var context, F = arguments[arguments.length - 1];
		if (arguments.length == 1)
			return F();
		else {
			context = arguments[0];
			
			if (arguments.length == 2)
				return F.apply(context);
			else
				return F.apply(context, arguments[1])
		}
	}
	
	jay.exec = function() {
		var F = arguments[arguments.length - 1];
		if (arguments.length == 1)
			return F();
		else 
			return F.apply(null, [].slice.call(arguments, 0, argument.length - 1));
	}
	
	jay.noop = function() {}
	
});
