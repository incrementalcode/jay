
/* Namespacing module, and bootstrap for Jay. */

if (typeof global == 'undefined') {
	global = window;
}

if (typeof global.jay == 'undefined') {
	global.jay = {};
}

(function(jay) {


	// namespace() will ensure that a given object path exists, and that references to the object can be obtained at any point and will remain valid.
	// the use of namespace is very similar to "scope()" except provides a named object that can be reused by another call to namespace.
	// (either on the global object or some hidden namespace store).
	jay.namespace = function(container, NS, definition) {
		var names = String(NS).split('/')

		for (var i = 0; i < names.length; i++) {
			// immunity against issues with //
			if (names[i] === '')
				continue;
				
			if (typeof container[names[i]] == 'undefined' || container[names[i]] == null) {
				container[names[i]] = {}
			}
			container = container[names[i]]
		}
		
		// TODO this should actually call customize() instead of embedding the code,
		// but that would cause circular dependency because all other files use the namespace function, perhaps they shouldn't?
		if (definition) {
			if (typeof definition == 'function') {
				definition.call(container, container)
			}
			else {
				for (var prop in definition) if (definition.hasOwnProperty(prop))
					container[prop] = definition[prop]
			}
		}
		
		return container
	}
	
	// will ensure that the base NS exists, and that all the given sub namespaces also exist within it, returning the base NS.
	jay.use = function(container, NS /* subNS, subNS */) {
		var ns = jay.namespace(container, NS);
		
		for (var i = 2; i < arguments.length; i++)
			// note: the namespace() func is immune to issues of double //'s
			jay.namespace(container, NS + '/' + arguments[i])
			
		return ns
	}
	
})(global.jay);

/* Typing module */

jay.namespace(global, 'jay', function() {
	
	/* mix-in functions */
	 
	// overlay will take all properties from the source and insert or overwrite them into the target, the fromDeep property indicates whether the source is just the direct layer of itself, or the full inheritance heirarchy.
	Object.overlay = function(o, properties, fromDeep) {
		for (var p in properties) if (fromDeep || properties.hasOwnProperty(p))
			o[p] = properties[p]
			
		return o
	}
	
	// just a shortcut to avoid a trailing last parameter
	Object.overlayDeep = function(o, properties) {
		return Object.overlay(o, properties, true)
	}
	
	// underlay will not overwrite properties that are already on the target object, the toDeep property specifies whether the target object is just the direct layer of the target, or the full inheritance heirarchy.
	Object.underlay = function(o, properties, fromDeep, toDeep) {
		for (var p in properties) if (toDeep && p in o || !toDeep && o.hasOwnProperty(p)) continue; else {
			if (fromDeep || properties.hasOwnProperty(p))
				o[p] = properties[p]
		}
	}
	
	Object.mixin = Object.overlay
	
	// lift them up to globals
	jay.overlay = Object.overlay
	jay.overlayDeep = Object.overlayDeep
	jay.underlay = Object.underlay
	jay.mixin = Object.mixin
	
	/* define property slots */
	
	
	// Object.defineProperty = function(name, descriptor) {}
	
	// jay.define = Object.defineProperties
	
		
	/* 3 means of object specification. */
		
	Object.customize = function(o, definition) {
		if (definition) {
			if (typeof definition == 'function') {
				definition.call(o, o)
			}
			else {
				for (var prop in definition) if (definition.hasOwnProperty(prop))
					o[prop] = definition[prop]
			}
		}
		
		return o
	}
	
	// Object.create = ...
	
	Object.specialize = function(parent, definition) {
		return Object.customize(Object.create(parent), definition)
	}
	
	// customize takes a definition function to run on an existing object, or another object to lay over the existing object.
	jay.customize = Object.customize
	
	// create returns a new object that has prototypal inheritance from the given parent object
	// no definition parameter is accepted like the ecma 5 Object.create does, because we don't use the descriptors
	jay.create = Object.create
	
	// specialize returns a new object that has prototype inheritance from the given parent object, 
	// and accepts a definition function or object that is passed to customize. 
	// the create() function in comparison to customize, accepts a descriptor object.
	jay.specialize = Object.specialize
	
	// mixin (this, wrapper(gld.Container, function () { return this.container }))
	// wrapper will automatically create functions that forward the calls to an object that is being wrapped,
	// the resulting wrapper is intended to be mixed in to the prototype object of the wrapper,
	// so it uses a function that each forwarding function will run to get the object that is being wrapped,
	// this will usually return a property of the wrapping object which is the wrapped object.
	// TODO make this work when there is no getWrapped function passed in, i.e. when it used directly on the wrapping object as opposed to it's prototype.	
	jay.wrapper = function(wrappedType, getWrapped) {
		var forwarder = {}
		for (var prop in wrappedType.prototype) if (wrappedType.prototype.hasOwnProperty(prop) && wrappedType.prototype[prop] instanceof Function) {
			// var methodName = prop
			forwarder[prop] = (function(methodName) {
				 return function() {
					var wrapped = getWrapped.call(this)
					return wrapped[methodName].apply(wrapped, arguments)
				}
			}(prop))
		}
		return forwarder
	}	

	// construct: jay.new = ...
	
	
	/* means of type specification */
	
	
	jay.constructor = function(parent, C) {
		return jay.prototype(parent, { constructor: C })
	}
	
	jay.type = jay.prototype = function(parent, protoDefinition) {
		var proto = jay.specialize(parent.prototype, protoDefinition), C = proto.constructor;
		if (!(proto.hasOwnProperty('constructor') && typeof proto.constructor == 'function'))
			C = function() { return parent.apply(this, arguments) };
		// TODO we can't use overlay(), we need to use underlay(), but it must check that the *value* is the same, not just that the property exists.
		// so we need a new type of mixin function, which isn't just about property existance, but about values.
		// the customize() function should probably consider this as well, in fact it might be exactly what should do that sort of comparison.
		jay.underlay(C, parent);
		// over and above simply using specialize to create a sub prototype object,
		// the following line (setting the constructors prototype link) is all that is really required by a prototype function
		C.prototype = proto;
		C.parent = parent;
		return proto.constructor = C;
	}
	
	// TODO I'm still not sure how interfaces should be specified,
	// should they be objects (which then rightly so wouldn't be usable in an instanceof check),
	// or should they be functions with methods on the prototype (which could easily lead to incorrect usage by making implementations sub types)?
	// should we have an "implements" function?
	
	/* type checking */
	
	// it isn't possible to create sub prototypes of String, Number, Boolean or Function,
	// so these type checking functions don't need to consider any issues that would be a result of that.
	
	// an object is anything that is not a void (and void includes null unlike the Javascript typeof operator says)
	Object.isObject = function(o) {
		// all objects also inherit from Object.prototype, perhaps we should test that seen as this is what user's are likely to want to test for.
		return !jay.isVoid(o);
	}
	
	jay.isNull = function(o) {
		return o === null
	}
	
	jay.isUndefined = function(o) {
		return typeof o == 'undefined';
	}
	
	jay.isVoid = function(o) {
		return o == null || typeof o == 'undefined';
	}

	// returns the second parameter if the first is void.
	jay.getDefault = function(a, b) {
		return (jay.isVoid(a)) ? b : a;
	}

	// a primitive value is one that cannot have properties set on it, they can still have properties read off it (they inherit from the builtin prototypes).
	// a void type is not a primitive (null does not inherit Object.prototype). we need to reaffirm the fact that a primitive is an object (see isObject which says objects are everything except voids).
	jay.isPrimitive = function(o) {
		var type = typeof o;
		if (o === null || type === 'undefined')
			return false;
		else if (type === 'object' || (type === 'function' || Object.prototype.toString.call(o) === '[object Function]'))
			return false;
		else
			return true
	}
	
	// unlike the typeof operator this returns a constructor function to represent the type, 
	// or returns null if o == null, and the undefined value if the type is undefined.
	// it also doesn't return 'object' like typeof would, instead it returns the direct constructor of the object,
	// so isTypeOf(o,C) should be used to test. 
	// Also, if the constructor property doesn't exist or has been set to a non function then Object is returned instead.
	// The nice thing about this function (which returns a constructor as opposed to a string) is that even if the object is not typeof 'string',
	// and is constructed by new String / new MyString, the typeof function will return a constructor that is a decendant of String,
	// which is why using istypeof is then so useful, because it checks if the constructor from typeof is a subconstructor of what is desired.
	// TODO the only extra issue that typeof really must solve / document is the case when an object is from another frame and one of the built-in types.
	jay.typeOf = function(o) {
		var t = (o === null) ? 'null' : typeof o;
		
		switch(t) {
			case 'undefined':
				return;
			case 'null':
				return null;
			// we could actually just use the constructor property for these builtin types (even the primitives),
			// but the important difference is that this at least makes things work as expected for all the built-in types
			// even when they are created in a separate frame / engine and therefore have a different constructor.
			// it would be better to use the toString trick so that we can catch all built-in types such as errors, regexp etc,
			// does that work consistently across engines?
			case 'string':
				return String;
			case 'number':
				return Number;
			case 'boolean':
				return Boolean;
			case 'function':
				return Function;
			default:
				// TODO a function has object access capability, so we want to use the 'constructor' property,
				// but what happens if a function is native (or in future just a callable) and doesn't have object access capability?
				return ('constructor' in o && Object.prototype.toString.call(o.constructor) == '[object Function]') ? o.constructor : Object;
		}
	}
	
	// constructorOf can fully replace the usage of the typeof operator.
	// using constructorOf can be an issue when we deal with cross frame objects, you would expect the exact constructor object from another frame,
	// whereas typeof wants to return a constructor object that is in this frame.
	jay.constructorOf = function(o) {
		return jay.typeOf(o)
	}
	
	// the typeof and constructorof system is very clever, however I think that
	// returning the string is preferred as opposed to a constructor function because 
	// it makes sense cross frame, where the actual constructor object is in another frame.
	// when typeOf accesses '.constructor' it is going to get an Object / Array / Function constructor that is from another frame,
	// this is also the case with custom user constructors.
	// perhaps it will help to have a classOf function which only means the base built-in classes types.
	// if the typeOf function ensures that it always returns the built-in constructors found within this frame then it will work as expected, and later checks against it work.
	
	// checks if the prototype of the constructor of o inherits from the prototype of C,
	// this includes the case of primitive values which always inherit from the builtin prototypes.
	// this is not designed to indicate when Object.create has been used to setup a prototype chain manually.
	jay.istypeof = function(o, C) {
		// TODO given the order of the parameters, this func should actually be called isoftype (or just istype), but we want to try keep consistent with isinstanceof, so what do we do?
		var T = jay.typeOf(o)

		if (T === null)
			return (C === null) ? true : false;
		else if (typeof T === 'undefined')
			return (typeof C === 'undefined') ? true : false;
			
		return T === C || T.prototype === C.prototype || jay.isinstanceof(T.prototype, C)
	}
	
	// isinstanceof effectively checks for a subset of the istypeof matches, which are not primitives.
	// with the built-in instanceof operator, o must not be primitive, C must be a function, or a TypeError may be thrown
	// this version does allow primitive to be checked accurately
	jay.isinstanceof = function(o, C) {
		return (jay.isPrimitive(o)) ?  false : o instanceof C 
	}
	
	jay.isprimitiveof = function(o, C) {
		return jay.isPrimitive(o) && jay.istypeof(o, C)
	}
	
	jay.isheirof = function(o, p) {
		// the internal Javascript equivalent of this isheirof functionality is actually what powers the functioning of the type checking system
		var F = function() {}
		F.prototype = p
		// this uses instanceof because it is more efficient, but falls back to typeOf if needed.
		// instanceof will only make it work for non primitives,
		// typeOf will make it work for primitives as well.
		return o instanceof F || jay.istypeof(o, F)
	}
	
	// TODO we want to be able to use the implementation of functionality directly on two prototypes or objects, 
	//	but the name isimplementionof should either refer to the relationship in which a subconstructor relates to the parent constructor,
	//	or where a value relates to a constructor it conforms to, I think the value option is better because it follows from isinstanceof etc,
	//	but then we should have something that tests the subconstructor / constructor relationship, this is something to look at when we consider interfaces / aspects.
	jay.isimplementationof = function (o, C) {
		if (typeof o == 'undefined' || o == null)
			return false;
		// using instanceof might actually complicate the expected result, perhaps we should just stick to the manual check? although this is faster.
		else if (jay.isinstanceof(o, C))
			return true;
		else {
			// could still be providing
			for (var p in C.prototype) {
				// this will check all inherited properties on the prototype
				// should we check all the prototype's properties or only functions?
				if ((typeof C.prototype[p] == 'function' || Object.prototype.toString.call(C.prototype[p]) == '[object Function]') && !(typeof o[p] == 'function' || Object.prototype.toString.call(o[p]) == '[object Function]'))
					return false
			}
			return true
		}
	}
	
});

/* ECMAScript 5 "implementation", functions mostly copied from Mozilla site. */

jay.namespace(global, 'jay', function(jay) {

	/* Object */

	jay.underlay(Object, {

		create: function(parent) {
			if (arguments.length == 0)
				parent = Object
			if (arguments.length > 1)
				throw new Error("This implementation of Object.create does not support descriptors.")
			var F = function () {}
			F.prototype = obj
			return new F()
		},

		keys: function(o) {
			var keys = [], k;
			for (k in o) if (Object.prototype.hasOwnProperty.call(o,k))
				keys.push(k);
			return keys
		},

		values: function(o) {
			var keys = Object.keys(o), vals = [], i = 0;
			for (; i < keys.length; i++)
				vals.push(o[keys[i]]);
			return vals
		}

	})

	/*
	Not fake-able, not a useful method either.
	Object.getOwnPropertyNames = function() {

	} */
	
	/* Date */
	
	jay.underlay(Date, {
		now: function now() {
			return +new Date();
		}
	})
	
	/* Functions */

	jay.underlay(Function.prototype, {
		
		bind: function(obj) {
			var slice = [].slice,
				args = slice.call(arguments, 1), 
				self = this, 
				nop = function () {}, 
				bound = function () {
				  return self.apply( this instanceof nop ? this : ( obj || {} ), 
									  args.concat( slice.call(arguments) ) );    
				};

			nop.prototype = self.prototype;

			bound.prototype = new nop();

			return bound;
		}

	})

	/* Strings */

	jay.underlay(String.prototype, {
		
		trim: function() {
			return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},

		contains: function(str) {
			return this.indexOf(str) >= 0
		}

	})

	/* Arrays */

	jay.underlay(Array, {

		isArray: function(o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		}

	})

	jay.underlay(Array.prototype, {
		
		item: function(i) {
			return this[i];
		},

		indexOf: function(searchElement /*, fromIndex */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0)
			  return -1;

			var n = 0;
			if (arguments.length > 0)
			{
			  n = Number(arguments[1]);
			  if (n !== n) // shortcut for verifying if it's NaN
				n = 0;
			  else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}

			if (n >= len)
			  return -1;

			var k = n >= 0
				  ? n
				  : Math.max(len - Math.abs(n), 0);

			for (; k < len; k++)
			{
			  if (k in t && t[k] === searchElement)
				return k;
			}
			return -1;
		},

		lastIndexOf: function(searchElement /*, fromIndex*/) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0)
			  return -1;

			var n = len;
			if (arguments.length > 0)
			{
			  n = Number(arguments[1]);
			  if (n !== n)
				n = 0;
			  else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}

			var k = n >= 0
				  ? Math.min(n, len - 1)
				  : len - Math.abs(n);

			while (k >= 0)
			{
			  if (k in t && t[k] === searchElement)
				return k;
			}
			return -1;
		},

		contains: function(el) {
			return this.indexOf(el) >= 0
		},


		every: function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in t && !fun.call(thisp, t[i], i, t))
				return false;
			}

			return true;
		},

		some: function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in t && fun.call(thisp, t[i], i, t))
				return true;
			}

			return false;
		},

		forEach: function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in t)
				fun.call(thisp, t[i], i, t);
			}
		},

		map: function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			var res = new Array(len);
			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in t)
				res[i] = fun.call(thisp, t[i], i, t);
			}

			return res;
		},

		filter: function(fun /*, thisp */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			var res = [];
			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in t)
			  {
				var val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t))
				  res.push(val);
			  }
			}

			return res;
		},

		reduce: function(fun /*, initialValue */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
			  throw new TypeError();

			// no value to return if no initial value and an empty array
			if (len == 0 && arguments.length == 1)
			  throw new TypeError();

			var k = 0;
			var accumulator;
			if (arguments.length >= 2)
			{
			  accumulator = arguments[1];
			}
			else
			{
			  do
			  {
				if (k in t)
				{
				  accumulator = t[k++];
				  break;
				}

				// if array contains no values, no initial value to return
				if (++k >= len)
				  throw new TypeError();
			  }
			  while (true);
			}

			while (k < len)
			{
			  if (k in t)
				accumulator = fun.call(undefined, accumulator, t[k], k, t);
			  k++;
			}

			return accumulator;
		},

		reduceRight: function(callbackfn /*, initialValue */) {
			"use strict";

			if (this === void 0 || this === null)
			  throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof callbackfn !== "function")
			  throw new TypeError();

			// no value to return if no initial value, empty array
			if (len === 0 && arguments.length === 1)
			  throw new TypeError();

			var k = len - 1;
			var accumulator;
			if (arguments.length >= 2)
			{
			  accumulator = arguments[1];
			}
			else
			{
			  do
			  {
				if (k in this)
				{
				  accumulator = this[k--];
				  break;
				}

				// if array contains no values, no initial value to return
				if (--k < 0)
				  throw new TypeError();
			  }
			  while (true);
			}

			while (k >= 0)
			{
			  if (k in t)
				accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
			  k--;
			}

			return accumulator;
		}

	})
	
});

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

/* Iteration module */

jay.namespace(global, 'jay', function(jay) {

	/* iteration */
	
	jay.Iterator = jay.type(Object, function() {

		this.object = null;
		this.result = null;
		
		this.constructor = function(o) {
			this.object = o;
		}
		
		this.stop = function(result) {
			this.result = result;
			throw 'stop';
		}

		this.iterator = function() {
			return this
		};
				
		this.iterate = function(F) {
			// if the 'result' object or 'stop' function were a property of the iterator you can't use the same iterator for nested loops.
			// so iterate() creates an Iteration which has a result and stop property.
			
			var iteration = new jay.Iteration(this), R;

			try {
				R = this.each(F, iteration);
				if (!jay.isUndefined)
					iteration.result = R;
			} catch (s) {
				if (s != 'stop')
					 throw s
			}
					
			return iteration.result
		};
		
		this.each = jay.abstract(function(F, iteration) {
			
		});
		
	})
	
	jay.Iteration = function(iter) {
		this.iterator = iter;
		this.result = {};
		
		this.stop = function(r) {
			if (!jay.isUndefined(r))
				this.result = r;
			throw 'stop';
		}
	}
	
	jay.PropertyIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var p in this.object)
				r = F(this.object[p], p, this.object, iter);
			
			return r;
		};
	})
	
	jay.ArrayIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object.length; i++)
				r = F(this.object[i], i, this.object, iter);
			
			return r
		};
	})
	
	jay.CollectionIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object.length; i++)
				r = F(this.object.item(i), i, this.object, iter);
			
			return r
		};
	})
	
	jay.EachIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			return this.object.each(F, iter);
		}
	})
	
	jay.NumberIterator = jay.type(jay.Iterator, function() {
		
		this.each = function(F, iter) {
			var r; for (var i = 0; i < this.object; i++) 
				F(i, i, this.object, iter)
				
			return r
		};
	})
	
	jay.StringIterator = jay.ArrayIterator;
	
	jay.KeyIterator = jay.type(jay.Iterator, function() {

		this.each = function(F, iter) {
			var i = 0, self = this;
			return iterator(this.object).each(function(v, k, o) {
				return F(k, i++, o, iter)
			})
		};
	})
	
	jay.ValueIterator = jay.type(jay.Iterator, function() {

		this.each = function(F, iter) {
			var i = 0, self = this;
			return iterator(this.object).each(function(v, k, o) {
				return F(v, i++, o, iter)
			})
		};
	})
	
	jay.Range = jay.type(Object, function() {
		
		this.constructor = function(first, last, step) {
			this.first = first
			this.last = last
			this.step = step ? step : 1
		}
		
		this.each = function(F, iter) {
			var R; for (var i = this.first, k = 0; i <= this.last; i += this.step)
				R = F(i, k++, this, iter);
			return R;
		}
		
	})
	
	// interface iIterable = { each: function(F) {} }
	// interface iCollection = { length: 0, item: function(i) {} }
	
	jay.iterator = function(o) {
		// if it's an object that specifies it's own iterator (which is how iterators return themselves)
		if (istypeof(o.iterator, Function))
			return o.iterator()
		else if (istypeof(o.each, Function))
			return new EachIterator(o)
		else if (istypeof(o, Number))
			return new NumberIterator(o)
		else if (istypeof(o, String))
			return new StringIterator(o)
		else if (istypeof(o, Array))
			return new ArrayIterator(o)		
		else if (typeof o.item == 'function' && typeof o.length != 'undefined')
			return new CollectionIterator(o)
		else if (typeof o != 'undefined' && o !== null)
			return new PropertyIterator(o)
		else
			throw new Error("Not iterable.")

	}
	
	jay.foreach = function(o, F) {
		return iterator(o).iterate(F)		
	}
	
	// TODO show usage of mapping an array to another array, and an object to another object, and two arrays to one object.
	
	jay.collector = function(/* (o,) F */) {
		// TODO this needs to accept an optional parameter 'acceptVoid', 
		// which causes undefined values to not be discarded. they should be discarded by default, null values should not.
		var o = ((arguments.length > 1) ? arguments[0] : []), F = ((arguments.length > 1) ? arguments[1] : arguments[0]);
		
		return function() {
			var r = F.apply(this, arguments);
			if (typeof r === 'undefined')
				o.push(r);
			return o;
		}
	}
	
	jay.range = function(first, last, step) {
		return new jay.Range(first, last, step)
	}
	
});

/* Misc module */

jay.namespace(global, 'jay', function(jay) {
	
	/* debugging / logging */
	
	jay.assert = function(expr, throwMe) {
		if (!Boolean(expr)) {
			throw jay.getDefault(throwMe, new Error("Assertion failed."))
		}
		return true
	}
	
	jay.debug = function(msg) {
		if (jay.debug.on) console.log(msg);
	};
	
	jay.debug.on = true;
	
	// once everything else is defined
	jay.overlay(global, jay);
});

/* Threading module */

jay.namespace(global, 'jay', function(threading) {
	
	/* This threading module allows multiple threads to be managed, using task-slicing. 
		It can schedule functions to run sequentially, potentially after a block has been cleared.
		It can synchronize asynchronous callbacks back into the sequential processing of a given thread.
		Threads can be put to sleep, woken up and killed. The thread rate of execution can be controlled.
		Continually executing functions can be implemented, by returning itself if it still wants to be executed again.
	*/
	
	threading.Thread = function(continuation, interval) {
		
		function th() {
			
			/* This is the thread function, it processes what ever has been scheduled for execution.
				The thread execution blocks whenever it encounters a function that has been blocked. */
			
			if (th.isPaused)
				return
				
			function processTasks(){
				
				th.isScheduledToProcess = false
				
				if (th.isPaused || th.queue.length == 0 || th.queue[0].isBlocked)
					return
				
				// set this as the current thread
				var prevThread = thread
				thread = th
				
				var task = th.queue.shift()
				
				task()
				
				if (th.queue.length > 0)
					scheduleProcessing()
				
				// restore the previous thread (this is only needed because the main thread doesn't actually execute so it doesn't restore itself)
				thread = prevThread
				
			}
			
			scheduleProcessing()
			
			function scheduleProcessing() {
				
				if (th.isScheduledToProcess)
					return
					
				th.isScheduledToProcess = true
				
				th.timer = setTimeout(processTasks, th.interval)
			}

		}
		
		th.isScheduledToProcess = false
		th.isPaused = false
		th.timer = null
		th.interval = (typeof interval == 'undefined') ? 100 : interval
		th.queue = []
		th.locks = []
		
		th.schedule = function(F) { if (typeof F != 'function') throw new Error("Trying to schedule a non-function!!")
			// we add the function onto the queue for normal invocation by the thread executor,
			
			th.queue.push(F)
			
			th()
			
			return F
		}
		
		th.sched = th.schedule
		
		th.sync = function(F) {
			
			/* A blocked function is put onto the thread. Once unblocked it will pass it's invocation to the actual function. 
				The thread cannot unblock the function. */
			
			var thisObj = null
			var args = null
			
			function blocker() {
				F.apply(thisObj, args)
			}
			
			blocker.isBlocked = true
			
			th.schedule(blocker)
			
			/* A function is returned to the caller, which can be invoked to unblock the scheduled function and run the thread. 
				The caller is obviously responsible for unblocking the function. */
			
			return function() {
				thisObj = this
				args = arguments
				delete blocker.isBlocked
				th()
			}
		}
		
		// if a function scheduled on the thread will no longer be called (an error occured in the code that would call it),
		// then it needs to be removed from the thread. The question is whether we remove all occurences of the function, 
		// just the first or only let the user remove by position index. 
		// The schedule function returns the function passed to it, however, the sync function needs to returns the function that unblocks the function passed to it, so it can be passed to caller,
		// so there is no way to remove that function passed to it unless that function itself is tracked separately, this can be very confusing to users (that they don't get the function itself but rather an unblocker)
		// to get the position indexes of a function find can be used().
		// ERROR the sync() function doesn't actually queue the function that it receives (which is a required feature).
		// the only way to remove a syncd function is to run the unblocker sync returns, and then remove the origin function before returning control to the scheduler.
		// TODO take out all these functions so people don't need to know this complication.
		// Alternatively, we can keep a list of functions that are on the queue and what positions they are in, so that the find and remove functions work properly,
		// as opposed to being complicated by the blocker functions...
		
		// remove all occurences of a function on the thread queue
		th.remove = function(F) { 
			typed(F, Function)
			console.log(' looking for F to remove from thread')
			for (var i = 0; i < th.queue.length; i++)
				if (th.queue[i] == F) {
					console.log ('found an occurence of F to remove from thread')
					th.remove(i)
					i--
				}
		}
		
		// remove the function at position i on the thread queue
		var suprRemove = th.remove;
		th.remove = function(i) {
			if (!isinstanceof(i, Number))
				suprRemove.call(this, i)
				
			if (i > th.queue.length - 1) {
				th.queue.splice(i, 1)
				if (i == 0) // if this one was blocking the thread make sure the thread is scheduled to process itself
					th()
			}
		}
		
		// get all the positions of function F in the thread queue
		th.find = function(F) {
			var p = []
			for (var i = 0; i < th.queue.length; i++)
				if (th.queue[i] == F)
					p.push(i)
			
			return p
		}
		
		th.blocked = th.sync // TODO what should we call this, just 'block'? then rename 'block' to 'wait'? or can the user just 'schedule(blocked(function(){}))'?
		
		th.block = function(duration) {
			// TODO, this function should probably block regardless of whether the thread is woken up while it is still blocked, 
			// i.e. use a function.isBlocked the same as sync does. These issues need to be made clear to the user.
			if (typeof duration != 'undefined' && duration == 0)
				return
				
			// the blocking only happens after tasks already scheduled are completed
			th.schedule(function() {
				// put the thread to sleep for the given duration
				th.sleep(duration)
			}) 
		}
		
		th.sleep = function(duration) {
			// pausing happens immediately
			if (typeof duration == 'undefined' || duration == null || duration > 0) { // don't really sleep if duration == 0
				clearInterval(th.timer)
				th.isPaused = true
				
				if (typeof duration != 'undefined' && duration >= 0)
					setTimeout(th.wakeup, duration)
			}
		}
				
		th.wakeup = function() {
			th.isPaused = false
			th()
		}
		
		th.kill = function() {
			// whats the difference between kill and sleep? 
			th.sleep()
		}
		
		if (continuation instanceof Function) {
			th.schedule(function repeater() {
				
				var result = continuation.call(th)

				// automatically scheduling itself it perhaps less flexible than we would like, make it return the function to reschedule. we want to be able to keep the thread alive, when the continuation has finished.
				
				if (result instanceof Function) {
					continuation = result
					th.schedule(repeater) // it makes a big difference if the continuation reschedules itself before or after it's execution, if before then the stuff it schedules in it's execution is never reached.
				}
				
			})
		}
		
		return th
	}
	
	threading.thread = threading.Thread() // the main thread
	
	threading.parallel = function(F, interval) {
		
		var th = Thread(F, interval)
		
		th()
		
		return th
		
	}
	
	threading.continual = threading.parallel
	
	// ends the current task so that the current thread receives control again, which can be passed on to another thread. (the task equivalent of a functions 'return').
	//threading.yield = function() { // yield(value, to)
		// throw some exception that the Thread executor receives, if we are in the top level thread (which is faked), then you can't yield (without an error going to the host application).
	//}
	
});

/* Publisher module */

jay.namespace (global, 'jay', function(exports) { 

	exports.Publisher = Publisher
	exports.TopicPublisher = TopicPublisher

	// TODO Publisher should be a wrapper around the more general and powerful TopicPublisher.

	function Publisher() {
		this.subscribers = []
	}

	Publisher.prototype.subscribe = function(listener) {
		this.subscribers.push(listener)
	}

	Publisher.prototype.unsubscribe = function(listener) {
		for (var i = 0; i < this.subscribers.length; i++)
			if (this.subscribers[i] === listener)
				delete this.subscribers[i]
	}

	Publisher.prototype.publish = function(src, data) { // should this take arbitrary args and pass on? It's easier to debug when an object is passed on.
		for (var i = 0; i < this.subscribers[topic].length; i++)
			this.subscribers[i].apply(src, data)
	}

	// Topic Publisher (not a subtype of publisher, a different interface)

	function TopicPublisher() {
		this.subscribers = {
		}
	}

	TopicPublisher.prototype.subscribe = function(topic, listener) {
		if (!this.subscribers[topic])
			this.subscribers[topic] = []
	
		this.subscribers[topic].push(listener)
		
		return listener
	}

	TopicPublisher.prototype.unsubscribe = function(topic, listener) {
		if (!this.subscribers[topic])
			return

		for (var i = 0; i < this.subscribers[topic].length; i++)
			if (this.subscribers[topic][i] === listener)
				delete this.subscribers[topic][i]
	}

	TopicPublisher.prototype.publish = function(topic, src, data) {
		if (!this.subscribers[topic])
			return

		for (var i = 0; i < this.subscribers[topic].length; i++)
			this.subscribers[topic][i].apply(src, data)
	}

});


/* JSON module 

    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
