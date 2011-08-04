
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
